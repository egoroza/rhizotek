const Footer = () => {
  return (
    <footer className="flex items-center justify-center w-full">
      <div className="py-5 flex justify-center max-w-6xl w-full mx-auto border-t border-text/20">
        <p className="text-xs text-center">human made with ❤️ by <a href="https://github.com/egoroza" target="_blank" rel="noopener noreferrer" className="font-semibold border-b-2 border-transparent hover:border-text transition-all duration-800 ease-in-out">nibbles</a>. <br /><span className="text-xs italic text-text/50">for educational and research purposes only.</span></p>
      </div>
    </footer>
  );
};

export default Footer;