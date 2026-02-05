import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { queryOne, query } from '@/lib/db';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

// Initialize demo user on first auth attempt
let dbInitialized = false;
async function ensureDemoUser() {
  if (dbInitialized) return;
  
  try {
    console.log('🔄 Ensuring demo user exists...');
    const passwordHash = await bcrypt.hash('Demo2026!', 10);
    
    await query(
      `INSERT INTO users (email, password_hash, display_name, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash`,
      ['demo@rehab.local', passwordHash, 'Demo User', 'athlete']
    );
    
    dbInitialized = true;
    console.log('✅ Demo user ensured');
  } catch (error) {
    console.error('❌ Demo user init error:', error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Ensure demo user exists on first auth attempt
          await ensureDemoUser();
          
          const user = await queryOne<User & { password_hash: string }>(
            'SELECT id, email, password_hash, display_name, role FROM users WHERE email = $1',
            [credentials.email]
          );

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.display_name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
