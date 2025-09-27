import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const pickFirstParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export default function ResetPasswordPage({
  searchParams = {},
}: ResetPasswordPageProps) {
  const accessToken =
    pickFirstParamValue(searchParams["access_token"]) ??
    pickFirstParamValue(searchParams["token"]);

  return <ResetPasswordForm accessToken={accessToken} />;
}
