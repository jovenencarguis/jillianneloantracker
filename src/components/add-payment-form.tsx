
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Client, Payment, RecentActivity } from "@/lib/types"
import { recentActivities as initialRecentActivities } from "@/lib/data"


const formSchema = z.object({
  paymentDate: z.date({ required_error: "A payment date is required." }),
  capitalPaid: z.coerce.number().min(0, "Cannot be negative."),
  interestPaid: z.coerce.number().min(0, "Cannot be negative."),
  notes: z.string().optional(),
}).refine(data => data.capitalPaid > 0 || data.interestPaid > 0, {
  message: "Total payment must be greater than 0.",
  path: ["capitalPaid"], // you can set the error on a specific field
});

type AddPaymentFormProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  client: Client
  onPaymentAdded: (updatedClient: Client) => void
}

const getStoredRecentActivities = (): RecentActivity[] => {
    if (typeof window === 'undefined') return initialRecentActivities;
    const stored = sessionStorage.getItem('recent-activities');
    return stored ? JSON.parse(stored) : initialRecentActivities;
}

const updateStoredRecentActivities = (activities: RecentActivity[]) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('recent-activities', JSON.stringify(activities));
    }
};

export function AddPaymentForm({ isOpen, onOpenChange, client, onPaymentAdded }: AddPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isDateHighlighted, setIsDateHighlighted] = useState(false)

  const calculateInterest = (balance: number) => {
    // Interest is 10% per month
    const monthlyInterestRate = (client.interestRate / 12) / 100;
    return parseFloat((balance * monthlyInterestRate).toFixed(2));
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentDate: new Date(),
      capitalPaid: 0,
      interestPaid: 0,
      notes: "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      // Reset form with default values when modal opens, especially the calculated interest
      form.reset({
        paymentDate: new Date(),
        capitalPaid: 0,
        interestPaid: calculateInterest(client.remainingBalance),
        notes: "",
      });
    }
  }, [isOpen, client, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPayment: Payment = {
        id: `p${Date.now()}`,
        date: values.paymentDate.toISOString(),
        capitalPaid: values.capitalPaid,
        interestPaid: values.interestPaid,
        totalPaid: values.capitalPaid + values.interestPaid,
    }
    
    const newRemainingBalance = client.remainingBalance - values.capitalPaid;
    const isPaidOff = newRemainingBalance <= 0;

    const updatedClient: Client = {
      ...client,
      remainingBalance: newRemainingBalance,
      payments: [...client.payments, newPayment],
      status: isPaidOff ? 'Paid Off' : 'Active'
    }

    const newActivity: RecentActivity = {
        id: `ra${Date.now()}`,
        type: isPaidOff ? 'paid_off' : 'payment',
        clientName: client.name,
        date: new Date().toISOString(),
        amount: newPayment.totalPaid,
    };
    const updatedActivities = [newActivity, ...getStoredRecentActivities()];
    updateStoredRecentActivities(updatedActivities);

    onPaymentAdded(updatedClient);

    toast({
        title: "Payment Added Successfully!",
        description: `Payment of ${newPayment.totalPaid.toFixed(2)} recorded for ${client.name}.`,
        className: "bg-accent text-accent-foreground",
    })
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Add Payment for {client.name}</DialogTitle>
          <DialogDescription>
            Enter the payment details. The remaining balance will be updated automatically.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Paid</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="YYYY-MM-DD"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const parsedDate = parse(e.target.value, "yyyy-MM-dd", new Date());
                            if (isValid(parsedDate)) {
                              field.onChange(parsedDate);
                            }
                          }}
                          className={cn(
                            "pr-10 transition-colors duration-300",
                             isDateHighlighted && "bg-green-100"
                          )}
                        />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                           <Button
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            aria-label="Pick a date"
                           >
                            <CalendarIcon className="h-4 w-4" />
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                field.onChange(date);
                                setIsDateHighlighted(true);
                                setTimeout(() => setIsDateHighlighted(false), 1500);
                            }}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capitalPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capital Paid</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Paid</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Interest-only payment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <DialogFooter className="pt-4 pr-0">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Payment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
