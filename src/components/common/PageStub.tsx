import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageStubProps {
  title: string;
  phase: string;
  description: string;
}

export function PageStub({ title, phase, description }: PageStubProps) {
  return (
    <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit gap-1 px-0"
        render={<Link href="/" />}
      >
        <ArrowLeft className="h-4 w-4" />
        홈으로
      </Button>

      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            {phase} 예정
          </Badge>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </main>
  );
}
