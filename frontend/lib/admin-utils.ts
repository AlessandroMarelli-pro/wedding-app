import { prisma } from './prisma';

export interface AdminValidationResult {
  isValid: boolean;
  admin?: any;
  error?: string;
}

export async function validateAdminExists(
  adminId: string,
): Promise<AdminValidationResult> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return {
        isValid: false,
        error: `Admin with ID ${adminId} not found in database`,
      };
    }

    return {
      isValid: true,
      admin,
    };
  } catch (error: any) {
    return {
      isValid: false,
      error: `Database error while validating admin: ${error.message}`,
    };
  }
}

export async function getAdminById(adminId: string) {
  return await prisma.admin.findUnique({
    where: { id: adminId },
  });
}
