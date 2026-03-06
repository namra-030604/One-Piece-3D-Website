import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import OnePiece from "@/pages/OnePiece";


function AppRouter() {
  return (
    <Router base={import.meta.env.BASE_URL}>
      <Switch>
        <Route path="/" component={OnePiece} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


export default App;
