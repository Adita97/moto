import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#111111",
          color: "#f0ece4",
          border: "1px solid #252525",
          fontFamily: '"DM Sans", sans-serif',
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#111111",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#111111",
          },
        },
      }}
    />
  );
}
