"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    image_url: string | null;
  };
}

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💵",
  },
  {
    id: "gcash",
    label: "GCash",
    description: "09XX XXX XXXX — Juan Dela Cruz",
    icon: "📱",
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "BDO — 1234 5678 9012 — Cocoir-Mart",
    icon: "🏦",
  },
];

const DELIVERY_METHODS = [
  {
    id: "delivery",
    label: "Home Delivery",
    description: "3–5 business days",
    icon: "🚚",
  },
  {
    id: "pickup",
    label: "Store Pickup",
    description: "Pick up at our store",
    icon: "🏪",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCart = async () => {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Prefill name from metadata
      const meta = user.user_metadata;
      if (meta?.first_name)
        setFullName(`${meta.first_name} ${meta.last_name ?? ""}`.trim());

      const { data } = await supabase
        .from("cart_items")
        .select(
          `id, quantity, product:products (id, name, price, stock, image_url)`,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      const cart = (data as unknown as CartItem[]) ?? [];
      if (cart.length === 0) {
        router.push("/cart");
        return;
      }
      setItems(cart);
      setLoading(false);
    };
    fetchCart();
  }, [router]);

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!/^(09|\+639)\d{9}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Enter a valid PH number";
    if (deliveryMethod === "delivery" && !address.trim())
      e.address = "Delivery address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);

    const supabase = supabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        full_name: fullName,
        phone,
        address: deliveryMethod === "delivery" ? address : null,
        subtotal,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      setPlacing(false);
      return;
    }

    // Insert order items
    await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        product_price: i.product.price,
        quantity: i.quantity,
        image_url: i.product.image_url, // ← add this line
      })),
    );

    // Decrement stock for each product
    for (const item of items) {
      await supabase.rpc("decrement_stock", {
        product_id: item.product.id,
        amount: item.quantity,
      });
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", user.id);

    router.push(`/orders/${order.id}/confirmation`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-stone-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-stone-800"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Checkout
        </h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Review your order and complete your purchase
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h2 className="font-bold text-stone-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Contact Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((p) => ({ ...p, fullName: "" }));
                  }}
                  placeholder="Juan Dela Cruz"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-800 placeholder:text-stone-300
                    focus:outline-none focus:ring-2 focus:ring-amber-600/15 transition-all
                    ${errors.fullName ? "border-red-300 focus:border-red-400" : "border-stone-200 focus:border-amber-600"}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  placeholder="09XX XXX XXXX"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-800 placeholder:text-stone-300
                    focus:outline-none focus:ring-2 focus:ring-amber-600/15 transition-all
                    ${errors.phone ? "border-red-300 focus:border-red-400" : "border-stone-200 focus:border-amber-600"}`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery method */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h2 className="font-bold text-stone-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Delivery Method
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {DELIVERY_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDeliveryMethod(m.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150
                    ${
                      deliveryMethod === m.id
                        ? "border-stone-800 bg-stone-50"
                        : "border-stone-200 hover:border-amber-300"
                    }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {m.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {m.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Address — only for delivery */}
            {deliveryMethod === "delivery" && (
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">
                  Delivery Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((p) => ({ ...p, address: "" }));
                  }}
                  placeholder="House no., Street, Barangay, City, Province, Zip Code"
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-800 placeholder:text-stone-300
                    focus:outline-none focus:ring-2 focus:ring-amber-600/15 transition-all resize-none
                    ${errors.address ? "border-red-300 focus:border-red-400" : "border-stone-200 focus:border-amber-600"}`}
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
            )}

            {deliveryMethod === "pickup" && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Pickup Location
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    123 Coir Street, Brgy. Sample, Manila, Philippines
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Mon–Sat, 8:00 AM – 5:00 PM
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h2 className="font-bold text-stone-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Payment Method
            </h2>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150
                    ${
                      paymentMethod === m.id
                        ? "border-stone-800 bg-stone-50"
                        : "border-stone-200 hover:border-amber-300"
                    }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-800">
                      {m.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {m.description}
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all
                    ${paymentMethod === m.id ? "border-stone-800 bg-stone-800" : "border-stone-300"}`}
                  />
                </button>
              ))}
            </div>

            {/* GCash / Bank instructions */}
            {paymentMethod === "gcash" && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
                <p className="text-xs font-bold text-blue-800">
                  GCash Payment Details
                </p>
                <p className="text-xs text-blue-700">
                  Send payment to:{" "}
                  <span className="font-semibold">09XX XXX XXXX</span>
                </p>
                <p className="text-xs text-blue-700">
                  Account name:{" "}
                  <span className="font-semibold">Juan Dela Cruz</span>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  After placing your order, please send payment and message us
                  your order ID as reference.
                </p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 space-y-1">
                <p className="text-xs font-bold text-green-800">
                  Bank Transfer Details
                </p>
                <p className="text-xs text-green-700">
                  Bank: <span className="font-semibold">BDO</span>
                </p>
                <p className="text-xs text-green-700">
                  Account number:{" "}
                  <span className="font-semibold">1234 5678 9012</span>
                </p>
                <p className="text-xs text-green-700">
                  Account name:{" "}
                  <span className="font-semibold">Cocoir-Mart</span>
                </p>
                <p className="text-xs text-green-600 mt-2">
                  After placing your order, please transfer the exact amount and
                  use your order ID as reference.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right — Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 sticky top-24">
            <h2
              className="font-bold text-stone-800"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-700 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-stone-400">× {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 shrink-0">
                    ₱
                    {(item.product.price * item.quantity).toLocaleString(
                      "en-PH",
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>
                  ₱
                  {subtotal.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">
                  {deliveryMethod === "pickup" ? "Free" : "Free"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-stone-800 text-base border-t border-stone-100 pt-2">
                <span>Total</span>
                <span className="text-amber-700">
                  ₱
                  {subtotal.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-3.5 bg-stone-800 hover:bg-amber-700 text-amber-50 text-sm font-semibold rounded-xl
                transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-md
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {placing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Placing Order…
                </span>
              ) : (
                "Place Order →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
