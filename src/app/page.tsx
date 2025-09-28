import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Solana Developer Tool
          </h1>
          <p className="text-xl text-gray-600">
            A comprehensive suite of tools for Solana blockchain development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Explorer</CardTitle>
              <CardDescription>
                Explore Solana accounts and their data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Builder</CardTitle>
              <CardDescription>
                Build and simulate Solana transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Inspector</CardTitle>
              <CardDescription>
                Analyze Solana programs and their instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Network Statistics</CardTitle>
              <CardDescription>
                View real-time Solana network metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Inspector</CardTitle>
              <CardDescription>
                Inspect SPL tokens and their metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validator Tools</CardTitle>
              <CardDescription>
                Tools for Solana validators and staking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Get started by exploring the tools above or check out our documentation.
          </p>
          <Button variant="outline">View Documentation</Button>
        </div>
      </div>
    </div>
  );
}
