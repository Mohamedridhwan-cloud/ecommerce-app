import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-hero-gradient">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Azura</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Considered goods for everyday wonder.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/products" search={{ category: "Electronics" } as never} className="hover:text-foreground">Electronics</Link></li>
            <li><Link to="/products" search={{ category: "Apparel" } as never} className="hover:text-foreground">Apparel</Link></li>
            <li><Link to="/products" search={{ category: "Home" } as never} className="hover:text-foreground">Home</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/account" className="hover:text-foreground">My account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Shipping & returns</li>
            <li>Contact support</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Azura. Crafted with care.
      </div>
    </footer>
  );
}
