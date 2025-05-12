import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Admin Wallet Login',
      credentials: {
        walletAddress: { label: 'Wallet Address', type: 'text', placeholder: '0x...' },
        // We can add a dummy password field if the provider requires it,
        // but we'll primarily authorize based on the walletAddress and its isAdmin flag.
        // For this phase, we'll assume connecting the wallet is the primary step,
        // and the authorize function checks if that wallet is an admin.
      },
      async authorize(credentials, req) {
        if (!credentials?.walletAddress) {
          return null;
        }
        const normalizedWalletAddress = credentials.walletAddress.toLowerCase();
        const hardcodedAdminWallet = "0x8ad8E63fF2d8979Bfb7df85DA78fDa0564e1A0d0".toLowerCase();

        let user = await prisma.user.findUnique({
          where: { walletAddress: normalizedWalletAddress },
        });

        // If the wallet address matches the hardcoded admin wallet, grant admin access
        if (normalizedWalletAddress === hardcodedAdminWallet) {
          if (!user) {
            // If the hardcoded admin user doesn't exist in DB, create them or prepare a user object
            // For simplicity, we'll ensure they are treated as admin.
            // The PrismaAdapter will handle creating the user if they don't exist based on returned object.
            // We must return an object that NextAuth can use.
            // It's better if the user record exists, so the register-wallet API is still important.
             user = await prisma.user.upsert({
                where: { walletAddress: normalizedWalletAddress },
                update: { isAdmin: true, isPremium: true }, // Ensure hardcoded admin is also premium
                create: {
                    walletAddress: normalizedWalletAddress,
                    isAdmin: true,
                    isPremium: true,
                }
            });
          } else if (!user.isAdmin || !user.isPremium) {
            // If user exists but isn't marked as admin/premium in DB, update them
            user = await prisma.user.update({
              where: { walletAddress: normalizedWalletAddress },
              data: { isAdmin: true, isPremium: true }
            });
          }
          // Fallthrough to return user object below
        }

        // Standard check for other users or if hardcoded admin was fetched/updated
        if (user) { // If user exists (admin or regular)
          return { 
            id: user.id, 
            walletAddress: user.walletAddress,
            email: user.email, 
            name: user.name,   
            isAdmin: user.isAdmin, // Pass the actual isAdmin status
            isPremium: user.isPremium, // Pass the actual isPremium status
          };
        } else {
          // If user does not exist in DB and is not the hardcoded admin,
          // we might want to create a basic user record here or rely on a separate registration flow.
          // For now, if not found and not hardcoded admin, deny.
          // Consider if a new non-admin, non-premium user should be created on first wallet connect.
          // The current `registerUserWallet` API seems to handle user creation.
          // This authorize function is primarily for *signing in* an existing or recognized user.
          return null; 
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Using JWT for sessions
    maxAge: 604800, // 7 days in seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist isAdmin and isPremium to the JWT token
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin; // Cast if TS complains user type from provider doesn't have isAdmin
        token.isPremium = (user as any).isPremium;
        token.walletAddress = (user as any).walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      // Persist isAdmin and isPremium to the session object
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isPremium = token.isPremium;
        (session.user as any).walletAddress = token.walletAddress;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login', // A custom login page for admins (we'll create this)
    // error: '/auth/error', // Custom error page (optional)
  },
  secret: process.env.NEXTAUTH_SECRET, // IMPORTANT: Set this in .env.local
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
