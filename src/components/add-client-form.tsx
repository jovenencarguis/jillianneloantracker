
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { Client, RecentActivity } from "@/lib/types"
import { getStoredRecentActivities, updateStoredData } from "@/lib/storage";

const occupations = [
  "Programmer",
  "Public Assistant",
  "Supervisor",
  "Room Attendant",
  "Security Guard",
  "Other",
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  passportNumber: z.string().optional(),
  mobile: z.string().min(1, { message: "Mobile number is required." }),
  occupation: z.string({ required_error: "Occupation is required." }),
  yearsWorking: z.coerce.number().int().positive({ message: "Must be a positive number." }),
  amountBorrowed: z.coerce.number().min(1, { message: "Amount must be greater than 0." }),
  interestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate seems too high."),
  borrowedDate: z.date({ required_error: "A borrowing date is required." }),
})

type AddClientFormProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onClientAdded: (newClient: Client) => void
}

export function AddClientForm({ isOpen, onOpenChange, onClientAdded }: AddClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [isDateHighlighted, setIsDateHighlighted] = useState(false)
  const [dateInput, setDateInput] = useState("")
  const { user } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      passportNumber: "",
      mobile: "",
      yearsWorking: 1,
      amountBorrowed: 0,
      interestRate: 10, // Default to 10%
    },
  })

  // Sync dateInput with form value when it changes
  const borrowedDateValue = form.watch("borrowedDate")
  useEffect(() => {
    if (borrowedDateValue && isValid(borrowedDateValue)) {
      setDateInput(format(borrowedDateValue, "yyyy-MM-dd"))
    }
  }, [borrowedDateValue])

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: "",
        passportNumber: "",
        mobile: "",
        yearsWorking: 1,
        amountBorrowed: 0,
        interestRate: 10,
      });
      setDateInput("");
    } else {
       form.setValue("borrowedDate", new Date());
       setDateInput(format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to add a client." });
        return;
    }
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newClient: Client = {
        id: `c${Date.now()}`,
        name: values.name,
        passportNumber: values.passportNumber,
        mobile: values.mobile,
        occupation: values.occupation,
        yearsWorking: values.yearsWorking,
        originalLoanAmount: values.amountBorrowed,
        interestRate: values.interestRate, // Store monthly rate
        loanDate: values.borrowedDate.toISOString(),
        payments: [],
        remainingBalance: values.amountBorrowed,
        status: 'Active',
    }
    
    const newActivity: RecentActivity = {
        id: `ra${Date.now()}`,
        action: 'Add Client',
        performedBy: user.name,
        role: user.role,
        target: newClient.name,
        details: `Loan of ${newClient.originalLoanAmount.toFixed(2)}`,
        date: new Date().toISOString(),
    };
    const updatedActivities = [newActivity, ...getStoredRecentActivities()];
    updateStoredData('activities', updatedActivities);


    // In a real app, you'd save this to Firebase or your backend.
    onClientAdded(newClient)

    toast({
        title: "Client Added Successfully!",
        description: `${newClient.name} has been added to the client list.`,
        className: "bg-accent text-accent-foreground",
    })
    
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Client</DialogTitle>
          <DialogDescription>
            Enter the details of the new borrower. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jillianne Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passport No. (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="P987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+85312345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an occupation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {occupations.map(occ => <SelectItem key={occ} value={occ}>{occ}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsWorking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years Working</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amountBorrowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Borrowed</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%/month)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
              </div>
              <FormField
                control={form.control}
                name="borrowedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Borrowing Date</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="YYYY-MM-DD"
                          value={dateInput}
                          onChange={(e) => {
                            const dateString = e.target.value;
                            setDateInput(dateString); // Update visual state immediately
                            const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
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
                                if (date) {
                                  field.onChange(date);
                                  setDateInput(format(date, "yyyy-MM-dd"));
                                  setIsDateHighlighted(true);
                                  setTimeout(() => setIsDateHighlighted(false), 1500);
                                }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 pr-0">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Client"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
