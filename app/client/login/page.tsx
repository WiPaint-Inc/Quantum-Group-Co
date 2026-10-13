import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/client/LoginForm";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <PageIntro
        kicker="Sign in"
        title="A placeholder session."
        lede="Enter an email to leave a cookie in this browser. There is no identity provider, no password, and no account. The cookie is unsigned."
      />
      <Suspense fallback={<p className="mt-10 text-sm text-sand/50">Preparing the form.</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
