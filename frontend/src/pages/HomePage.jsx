import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from "@heroui/react";
import { Typewriter } from 'react-simple-typewriter';
import { ArrowUpRight } from "lucide-react";

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white font-sans">
      {/* <img
        alt="Public Rooms"
        className="object-cover w-full h-full absolute top-0 left-0 z-0"
        src="bg.jpg"
      /> */}
      <Card className="max-w-3xl w-full rounded-3xl shadow-md border border-gray-200 bg-white p-10 text-center">
        
        <h1 className="text-3xl font-semibold mb-5 text-gray-900 tracking-tight leading-snug">
          <Typewriter
            words={['Welcome to Room Loop']}
            loop={1}
            cursor
            cursorStyle="."
            typeSpeed={85}
          />
        </h1>

        <p className="text-lg mb-5 leading-relaxed text-gray-700 font-normal">
          Your go-to platform for <span className="font-medium">spontaneous events</span> and 
          <span className="font-medium"> short-term group coordination</span>.
        </p>

        <p className="text-md text-gray-500 mb-5 font-light">
          Whether it's a quick study session, brainstorming meetup, or a casual hangout - Room Loop connects you instantly.
          <br />
          <span className="font-medium">Connect in seconds.</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/register">
  <Button
    size="sm"
    radius="full"
    variant="ghost"
    className="font-medium px-5 py-2 text-black border-black border-1 gap-2"
  >
    Get Started <ArrowUpRight size={12} />
  </Button>
</Link>
<Link to="/login">
  <Button
    size="sm"
    radius="full"
    variant="ghost"
    className="font-medium px-5 py-2 text-black border-black border-1 gap-2"
  >
    Login <ArrowUpRight size={12} />
  </Button>
</Link>
        </div>
      </Card>
    </div>
  );
}

export default HomePage;
