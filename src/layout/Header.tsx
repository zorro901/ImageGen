import { SignOutButton, useUser } from "@clerk/nextjs";
import { type UserResource } from "@clerk/types";
import { Lato } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { BiImage } from "react-icons/bi";

const font = Lato({
  weight: ["700"],
  subsets: ["latin"],
});

export default function Header() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <header className="flex flex-row justify-between border-b border-gray-300/50 px-4 py-4 text-purple-600 shadow-md">
      <Link href="/" className="flex flex-row items-center">
        <BiImage fontSize={35} className="mr-3" />
        <div
          className="flex flex-row font-mono text-xl font-bold"
          style={font.style}
        >
          ImageGen
        </div>
      </Link>

      <div className="flex flex-row items-center gap-2">
        {user && isSignedIn && (
          <SignOutButton signOutCallback={() => router.push("/")}>
            <button className="group relative flex flex-col gap-4 font-bold hover:text-purple-800">
              <span>Sign Out</span>
              <div className="absolute -bottom-1 mx-auto h-[2px] w-full origin-center scale-x-0 bg-purple-600 transition-all duration-200 group-hover:scale-x-100"></div>
            </button>
          </SignOutButton>
        )}

        {!isLoaded && <span>Loading...</span>}
        {user && <UserAvatar user={user} />}
      </div>
    </header>
  );
}

interface UserAvatarProps {
  user: UserResource;
}

function UserAvatar({ user }: UserAvatarProps) {
  return (
    <div className="overflow-hidden rounded-full shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="User" src={user.imageUrl} width={40} height={40} />
    </div>
  );
}
