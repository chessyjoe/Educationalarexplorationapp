import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface ParentalGateProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ParentalGate({ isOpen, onClose, onSuccess }: ParentalGateProps) {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Generate a random math problem (e.g. 7 x 8)
            setNum1(Math.floor(Math.random() * 7) + 5); // 5 to 11
            setNum2(Math.floor(Math.random() * 6) + 6); // 6 to 11
            setAnswer('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAnswer = parseInt(answer.trim(), 10);

        if (numAnswer === num1 * num2) {
            onSuccess();
        } else {
            setError('Incorrect answer. Please try again.');
            setAnswer('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-in zoom-in-95 p-6">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6 mt-2">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ask Your Parents</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        To access the Parent Dashboard, please solve the following math problem:
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="answer" className="text-center block text-xl mb-4">
                            What is {num1} × {num2}?
                        </Label>
                        <Input
                            id="answer"
                            type="number"
                            value={answer}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
                            className="text-center text-xl h-14"
                            placeholder="Enter the answer"
                            autoFocus
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                    )}

                    <Button type="submit" className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700">
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    );
}
