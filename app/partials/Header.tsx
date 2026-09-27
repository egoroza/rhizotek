import { Link } from "react-router";

const Header = () => {
  return (
    <header className="flex items-center justify-center flex-col gap-4">
      <div className="max-w-6xl w-full mx-auto py-5 flex items-center justify-between border-b border-text/20">
        <Link to="/" className="font-logo text-2xl">rhizotek</Link>
        <nav className="w-full flex items-center justify-end">
          <ul className="flex items-center gap-8">
            <li><Link to="/browse" className="text-sm lowercase font-heading font-normal border-b border-transparent hover:border-text transition-all duration-800 ease-in-out">Browse</Link></li>
            <li><Link to="/recipes" className="text-sm lowercase font-heading font-normal border-b border-transparent hover:border-text transition-all duration-800 ease-in-out">My Recipes</Link></li>
            <li><Link to="/experiments" className="text-sm lowercase font-heading font-normal border-b border-transparent hover:border-text transition-all duration-800 ease-in-out">My Experiments</Link></li>
            <li><Link to="/login" className="text-sm lowercase font-heading font-normal border-b border-transparent hover:border-text transition-all duration-800 ease-in-out">Login / SignUp</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;