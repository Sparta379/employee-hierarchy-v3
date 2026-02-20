import { AiOutlineFileText } from 'react-icons/ai';
import Link from 'next/link'; // Import Link for Next.js navigation

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 shadow-inner mt-8 flex flex-col md:flex-row justify-between items-center">
      {/* Left side: User manual link with icon */}
      <Link
        href="/user-manual"
        className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors mb-2 md:mb-0"
      >
        <AiOutlineFileText size={20} />
        <span>User Manual</span>
      </Link>

      {/* Center: copyright */}
      <p className="text-center text-gray-400">
        &copy; {new Date().getFullYear()} EPI-USE Hierarchy. All rights reserved.
      </p>

      {/* Right side: Optional additional links or social media icons */}
      <div className="flex space-x-4">
        {/* Add more links or social icons here if needed */}
        {/* <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</Link> */}
      </div>
    </footer>
  );
}
