const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        
        <p className="text-sm">
          © {year} <span className="text-white font-medium">TrackWise</span>. All rights reserved.
        </p>

        <div className="flex gap-5 text-sm">
          <a href="#" className="hover:text-white transition">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition">
            Terms
          </a>
          <a href="#" className="hover:text-white transition">
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
