export type RazorpaySession = {
  configured: true;
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: "INR";
};

export type RazorpayResult = { orderId: string; paymentId: string; signature: string };

type RazorpayCheckout = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

export function openRazorpay(
  session: RazorpaySession,
  prefill: { name: string; email: string; contact: string },
  method: "upi" | "card" | "netbanking",
) {
  return new Promise<RazorpayResult | null>((resolve) => {
    let settled = false;
    const finish = (result: RazorpayResult | null) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const Checkout = window.Razorpay;
    if (!Checkout) {
      finish(null);
      return;
    }
    const checkout = new Checkout({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      name: "Earthen",
      description: "Quiet clothes",
      order_id: session.razorpayOrderId,
      prefill,
      theme: { color: "#b85c45" },
      config: methodBlock(method),
      handler(response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
        finish({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      modal: { ondismiss: () => finish(null) },
    });
    checkout.open();
  });
}

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function methodBlock(method: "upi" | "card" | "netbanking") {
  const name = method === "upi" ? "UPI" : method === "card" ? "Card" : "Net banking";
  return {
    display: {
      blocks: {
        chosen: { name, instruments: [{ method }] },
      },
      sequence: ["block.chosen"],
      preferences: { show_default_blocks: false },
    },
  };
}
