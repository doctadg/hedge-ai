import Link from "next/link";
import Image from "next/image";
import { Twitter, Linkedin, Github } from "lucide-react"; // Assuming lucide-react is installed for icons

export function FooterSection() {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Features", href: "/#features" }, // Link to homepage features section
        // Add other relevant platform links if they exist
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" }, // Placeholder link
        { name: "Contact", href: "/contact" }, // Placeholder link
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" }, // Placeholder link
        { name: "Terms of Service", href: "/terms" }, // Placeholder link
      ],
    },
  ];

  return (
    <footer className="bg-black text-gray-400 border-t border-gray-800 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Logo & Description */}
          <div className="md:col-span-1 flex flex-col items-start">
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/hedgelogo.png"
                alt="Hedge AI Logo"
                width={120} // Adjust width as needed
                height={32} // Adjust height based on aspect ratio
                priority
              />
            </Link>
            <p className="text-sm">
              The future of decentralized finance intelligence.
            </p>
          </div>

          {/* Columns 2-4: Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            {/* Copyright */}
            <p className="text-xs text-gray-500 mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} Hedge AI. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex space-x-5">
              <Link href="#" aria-label="Twitter" className="text-gray-500 hover:text-white transition-colors duration-200">
                <Twitter size={18} />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-white transition-colors duration-200">
                <Linkedin size={18} />
              </Link>
              <Link href="#" aria-label="GitHub" className="text-gray-500 hover:text-white transition-colors duration-200">
                <Github size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
