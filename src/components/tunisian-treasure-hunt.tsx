"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from '@/hooks/use-mobile';

const PASSWORD = "lablabi";

export default function TunisianTreasureHunt() {
  const [interactions, setInteractions] = useState(0);
  const [maxClicks, setMaxClicks] = useState(30);
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [isComplete, setIsComplete] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const images = PlaceHolderImages;

  useEffect(() => {
    // Retrieve maxClicks from sessionStorage on component mount
    const savedMaxClicks = sessionStorage.getItem('maxClicks');
    if (savedMaxClicks) {
      setMaxClicks(parseInt(savedMaxClicks, 10));
    }
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const handleInteraction = () => {
    if (isComplete) return;

    const newInteractions = interactions + 1;
    setInteractions(newInteractions);
    
    if (newInteractions >= maxClicks -1) {
        setShowPasswordPrompt(true);
    } else {
        const newTop = Math.random() * 80 + 10;
        const newLeft = Math.random() * 80 + 10;
        setPosition({ top: newTop, left: newLeft });
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput.toLowerCase() === PASSWORD) {
      setIsComplete(true);
      setPosition({ top: 50, left: 50 });
      setShowPasswordPrompt(false);
      toast({
        title: "Correct!",
        description: "You've unlocked the final step!",
      });
      sessionStorage.removeItem('maxClicks'); // Reset on win
    } else {
      const newMaxClicks = maxClicks + 15;
      sessionStorage.setItem('maxClicks', newMaxClicks.toString());
      toast({
        variant: "destructive",
        title: "Wrong Answer",
        description: "You are close! The challenge just got harder.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  
  const handleDownloadClick = () => {
    const link = document.createElement('a');
    const basePath = process.env.NODE_ENV === 'production' ? '/clue1' : '';
    link.href = `${basePath}/Tunisian_Dictionary.pdf`;
    link.setAttribute('download', 'Tunisian_Dictionary.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started!",
      description: "You've successfully found the Tunisian Dictionary.",
    });
  };

  if (isMobile === undefined) {
    return null; // or a loading spinner
  }

  if (isMobile) {
    return (
      <main className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold font-headline text-foreground mb-4">Unsupported Device</h1>
          <p className="text-lg text-muted-foreground">
            For the best experience, please play this game on a PC.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background">
      {images.map((image, index) => (
        <Image
          key={image.id}
          src={process.env.NODE_ENV === 'production' ? `/clue1${image.imageUrl}` : image.imageUrl}
          alt={image.description}
          fill
          priority={index === 0}
          className={cn(
            'object-cover transition-opacity duration-1000 ease-in-out',
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          )}
          data-ai-hint={image.imageHint}
        />
      ))}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
        <div
          onMouseEnter={isComplete || showPasswordPrompt ? undefined : handleInteraction}
          style={{
            position: 'absolute',
            top: `${position.top}%`,
            left: `${position.left}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.1s ease-in-out, left 0.1s ease-in-out',
          }}
          className={cn(
            'z-20',
            isComplete && 'animate-pulse'
          )}
        >
          <Button
            onClick={isComplete ? handleDownloadClick : undefined}
            onMouseDown={!isComplete && !showPasswordPrompt ? handleInteraction : undefined}
            onTouchStart={!isComplete && !showPasswordPrompt ? handleInteraction : undefined}
            className="font-headline text-lg shadow-2xl rounded-lg px-6 py-6 bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label={isComplete ? 'Download Dictionary Now' : 'Try to download dictionary'}
          >
            <Download className="mr-2 h-5 w-5" />
            {isComplete ? 'Download Now' : 'Download Dictionary'}
          </Button>
        </div>
      </div>
      
      <AlertDialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>One last step!</AlertDialogTitle>
            <AlertDialogDescription>
              To prove your worth, name one of the most famous dishes in Tunisia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Enter the dish name"
            />
          </div>
          <AlertDialogFooter>
            <Button onClick={handlePasswordSubmit}>Unlock</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
