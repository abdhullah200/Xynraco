import { SignInFormClient } from "@/features/auth/components/sign-form-client";
import Image from "next/image";
import React from "react";

const SignInPage = () => {
  return (
    <div className="space-y-6 flex flex-col justify-center">
      <Image
        src="/logo.png"
        alt="Vibracode Logo"
        width={180}
        height={180}
        className="mx-auto mb-2 drop-shadow-lg"
        priority
      />
      <SignInFormClient />
    </div>
  )
}

export default SignInPage;
