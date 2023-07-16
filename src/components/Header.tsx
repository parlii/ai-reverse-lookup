import { FaGithub } from "react-icons/fa";

const Header = () => {
  return (
    <div className="flex items-center justify-between justify-center space-x-4">
      <h1 className="text-2xl font-bold text-center mt-6 mb-4">
        AI reverse lookup dictionary
      </h1>
      <a href="https://github.com/parlii/ai-reverse-lookup">
        <FaGithub className="inline-block" size={24} />
      </a>
    </div>
  );
}

export default Header;
