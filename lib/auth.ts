import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"


export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const code = credentials?.code as string

        if (!email || !code) return null

        // Verify OTP token
        const token = await db.verificationToken.findFirst({
          where: {
            identifier: email,
            token: code,
            expires: { gt: new Date() },
          },
        })

        if (!token) return null

        // Delete used token
        await db.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token: code,
            },
          },
        })

        // Find existing user (user must already be registered)
        const user = await db.user.findUnique({ where: { email } })

        if (!user) return null

        if (!user.emailVerified) {
          await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
