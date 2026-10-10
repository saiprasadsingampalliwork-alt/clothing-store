import { Article } from "@/components/article";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Article title="Privacy">
      <p>We collect the name, email, mobile number, and address you give us to fulfil an order, and we keep order records for the period Indian tax law requires.</p>
      <p>Card numbers stay with the payment gateway. We do not sell personal data. You can ask us to delete an account, except records we must keep for GST.</p>
      <p>This prototype stores your bag, account, and orders in this browser only. Nothing is sent to a server.</p>
    </Article>
  );
}
