import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from "@heroui/react";

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 px-4 py-12">
      <Card className="max-w-3xl w-full rounded-3xl shadow-2xl border border-gray-200 bg-white p-10 text-center">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-6">
          Welcome to <span className="text-green-600">RoomLoop</span>!
        </h1>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          Your go-to platform for <strong className="text-blue-600">spontaneous drop-in events</strong> and 
          <strong className="text-green-600"> short-term group coordination</strong>.
        </p>

        <p className="text-md text-gray-600 mb-10">
          Whether it’s a quick study session, brainstorming meetup, or a casual hangout—RoomLoop connects you instantly.
          <br />
          <span className="font-medium text-blue-500">Just drop in and connect!</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button
              color="success"
              size="lg"
              radius="lg"
              variant="shadow"
              className="font-semibold px-8 py-3 hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button
              color="primary"
              size="lg"
              radius="lg"
              variant="shadow"
              className="font-semibold px-8 py-3 hover:scale-105 transition-transform duration-200"
            >
              Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default HomePage;
