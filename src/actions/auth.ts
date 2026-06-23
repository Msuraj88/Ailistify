"use server";

import { hashPassword } from "@/lib/auth/password";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth";
import type { ActionResult } from "@/types";
import type { RegisterInput } from "@/validations/auth";

export async function registerUser(
  input: RegisterInput,
): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    return { success: true, data: { email: normalizedEmail } };
  } catch {
    return {
      success: false,
      error: "Failed to create account. Please try again later.",
    };
  }
}
