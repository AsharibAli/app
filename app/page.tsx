import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const dapps = [
  {
    title: "Simple Greeting",
    description: "Send and receive greetings on the blockchain",
    features: [
      "Simple greetings dapp",
      "Send and receive greetings onchain",
      "Display the last greeting",
    ],
    route: "/simple-greeting-dapp",
  },
  {
    title: "Study Timer Tracker",
    description: "Track study time on the blockchain",
    features: [
      "Start and stop a study timer",
      "Record study session duration",
      "Display total study time",
    ],
    route: "/study-time-dapp",
  },
  {
    title: "Student Anonymous Feedback",
    description: "Submit anonymous feedback about courses",
    features: [
      "Simple feedback form",
      "Store feedback on-chain anonymously",
      `Only educators with ocid usernames that start with 'edu_' can view aggregated feedback.`,
    ],
    route: "/anonymous-feedback-dapp",
  },
  {
    title: "Assignment Submission",
    description: "Submit proof of assignment completion",
    features: [
      "Upload assignment details",
      "Store submission details on-chain",
      `Only educators ocid with usernames that start with 'edu_' can verify and view submissions.`,
    ],
    route: "/assignment-submission-dapp",
  },
  {
    title: "Classroom Poll",
    description: "Conduct quick polls during class sessions",
    features: [
      "Create and display polls",
      "Record votes on-chain",
      "Real-time poll results",
    ],
    route: "/class-poll-dapp",
  },
  {
    title: "Study Group Chat",
    description: "Students share messages in a group chat.",
    features: [
      "Join group chat and share messages",
      "Record messages on-chain",
      "Show the Messages",
    ],
    route: "/student-group-dapp",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-20 my-10">
        {/* Adjusted spacing */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-teal-800 mb-6">
            EduHub
          </h1>
          <p className="text-2xl text-teal-600 max-w-2xl mx-auto leading-relaxed">
          Explore our educational dApps designed to help you complete tasks on EDU Chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dapps.map((dapp, index) => (
            <Link
              href={dapp.route}
              key={index}
              className="transform transition-transform hover:scale-105"
            >
              <Card className="h-full border-2 border-teal-200 hover:border-teal-400 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-teal-700">
                    {dapp.title}
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    {dapp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-teal-800">
                    {dapp.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
