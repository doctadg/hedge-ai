import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's database ID. */
      id: string;
      /** The user's wallet address. */
      walletAddress?: string | null;
      /** Whether the user is an admin. */
      isAdmin?: boolean | null;
      /** Whether the user has premium access. */
      isPremium?: boolean | null;
    } & DefaultSession["user"]; // Keep the default properties like name, email, image if they exist
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   * Also used in the `authorize` callback of the Credentials provider.
   */
  interface User extends DefaultUser {
    // Add the properties returned by your authorize callback or adapter user model
    walletAddress?: string | null;
    isAdmin?: boolean | null;
    isPremium?: boolean | null;
    // id is already part of DefaultUser
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** User's database ID */
    id?: string;
    /** User's wallet address */
    walletAddress?: string | null;
    /** Whether the user is an admin */
    isAdmin?: boolean | null;
    /** Whether the user has premium access */
    isPremium?: boolean | null;
  }
}
