import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "../../../lib/supabase"; // Import the supabase client

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Call Supabase to authenticate the user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Return user data to be stored in session
        return { id: data.user.id, email: data.user.email, user_type: data.user.user_metadata.user_type };
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin', // Optional: custom sign-in page
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Save the user data into the JWT token (this will be available in the session)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.user_type = user.user_type;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach user data to the session
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.user_type = token.user_type;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // Ensure you have set this in .env.local
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
