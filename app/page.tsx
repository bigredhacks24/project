import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Welcome to Big Red Hacks</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with friends, plan events, and create lasting memories.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Create Circles"
            description="Form groups with your friends and organize events together."
          />
          <FeatureCard
            title="Plan Events"
            description="Easily schedule and manage events with your circles."
          />
          <FeatureCard
            title="Share Memories"
            description="Upload and view photos from your past events."
          />
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join Big Red Hacks today and start connecting with your friends!
          </p>
          <Button asChild size="lg">
            <Link href="/sign-up">Sign Up Now</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
