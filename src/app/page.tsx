"use client";

import { useState } from "react";
import type { EmployeeData, PayrollResult, Totals } from "@/lib/payroll-calculator";
import { processPayroll } from "@/lib/payroll-calculator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Download, Calculator, FileText, Banknote, Building, Users, ArrowLeft, Loader2, User, Printer, FileSpreadsheet } from "lucide-react";

// Mock Data
const mockEmployeeData: EmployeeData[] = [
  { id: 1, name: "Juan Dela Cruz", monthlySalary: 25000 },
  { id: 2, name: "Maria Clara", monthlySalary: 45000 },
  { id: 3, name: "Andres Bonifacio", monthlySalary: 70000 },
  { id: 4, name: "Jose Rizal", monthlySalary: 120000 },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [payrollResults, setPayrollResults] = useState<PayrollResult[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const { toast } = useToast();

  const handleProcessPayroll = async () => {
    setIsLoading(true);
    try {
      const { results, totals } = await processPayroll(mockEmployeeData);
      setPayrollResults(results);
      setTotals(totals);
      setStep(2);
    } catch (error) {
      console.error("Payroll processing error:", error);
      toast({
        variant: "destructive",
        title: "Error Processing Payroll",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPayrollResults([]);
    setTotals(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };
  
  const StatCard = ({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  const Payslip = ({ result }: { result: PayrollResult }) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Payslip</h3>
        <p className="text-muted-foreground">For the period of {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
        <div>
          <p className="font-semibold">{result.employee.name}</p>
          <p className="text-sm text-muted-foreground">Employee</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatCurrency(result.employee.monthlySalary)}</p>
          <p className="text-sm text-muted-foreground">Monthly Salary</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <h4 className="font-semibold col-span-2 text-primary">Earnings</h4>
        <p>Gross Pay</p>
        <p className="text-right">{formatCurrency(result.grossPay)}</p>
        
        <h4 className="font-semibold col-span-2 mt-4 text-primary">Deductions</h4>
        <p>SSS Contribution</p>
        <p className="text-right">{formatCurrency(result.deductions.sss)}</p>
        <p>PhilHealth Contribution</p>
        <p className="text-right">{formatCurrency(result.deductions.philhealth)}</p>
        <p>Pag-IBIG Contribution</p>
        <p className="text-right">{formatCurrency(result.deductions.pagibig)}</p>
        <p>Withholding Tax</p>
        <p className="text-right">{formatCurrency(result.deductions.tax)}</p>
        <p className="font-medium">Total Deductions</p>
        <p className="text-right font-medium">{formatCurrency(result.deductions.total)}</p>
      </div>
      <div className="flex justify-between items-center rounded-lg border bg-muted p-4 mt-4">
        <p className="text-lg font-bold">Net Pay</p>
        <p className="text-lg font-bold text-accent">{formatCurrency(result.netPay)}</p>
      </div>
       <Button className="w-full mt-4" variant="outline"><Printer className="mr-2 h-4 w-4" /> Print / Download PDF</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Philippine Payroll Pro</h1>
              <p className="text-sm text-muted-foreground">Simplified Payroll Processing for Philippine Businesses</p>
            </div>
          </div>
          {step === 2 && (
             <Button onClick={handleReset} variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> Process New Payroll</Button>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    <UploadCloud className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl">Start Payroll Processing</CardTitle>
                <CardDescription>Upload your employee data file to begin calculations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Employee data is pre-loaded for this demo.</p>
                  <p className="text-sm text-muted-foreground">Click "Process Payroll" to continue.</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-black">
                    <Download className="mr-2 h-5 w-5" /> Download Template
                  </Button>
                  <Button size="lg" onClick={handleProcessPayroll} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Calculator className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? "Processing..." : "Process Payroll"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && totals && payrollResults.length > 0 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Payroll Dashboard</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Banknote className="h-4 w-4 text-muted-foreground" />} title="Total Net Payroll" value={formatCurrency(totals.netPay)} description="Amount to be paid to employees" />
                <StatCard icon={<Users className="h-4 w-4 text-muted-foreground" />} title="Total EE Deductions" value={formatCurrency(totals.sss.ee + totals.philhealth.ee + totals.pagibig.ee + totals.tax)} description="SSS, PhilHealth, Pag-IBIG, Tax" />
                <StatCard icon={<Building className="h-4 w-4 text-muted-foreground" />} title="Total ER Contributions" value={formatCurrency(totals.sss.er + totals.philhealth.er + totals.pagibig.er)} description="SSS, PhilHealth, Pag-IBIG" />
                <StatCard icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />} title="Total Payroll Cost" value={formatCurrency(totals.grossPay + totals.sss.er + totals.philhealth.er + totals.pagibig.er)} description="Gross pay + Employer share" />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Detailed breakdown of payroll calculations for all employees.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Gross Pay</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead className="text-right">ER Cost</TableHead>
                      <TableHead className="text-center">Payslip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollResults.map((result) => (
                      <TableRow key={result.employee.id}>
                        <TableCell className="font-medium">{result.employee.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.grossPay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.deductions.total)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">{formatCurrency(result.netPay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.totalERCost)}</TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                               <DialogHeader>
                                <DialogTitle>Payslip for {result.employee.name}</DialogTitle>
                              </DialogHeader>
                              <Payslip result={result} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Payment Vouchers</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                      <CardHeader><CardTitle>Employee Payroll</CardTitle></CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{formatCurrency(totals.netPay)}</p>
                          <Button className="w-full mt-4" variant="outline"><Download className="mr-2 h-4 w-4"/> Download Voucher</Button>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader><CardTitle>SSS Payments</CardTitle></CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{formatCurrency(totals.sss.ee + totals.sss.er)}</p>
                          <Button className="w-full mt-4" variant="outline"><Download className="mr-2 h-4 w-4"/> Download Voucher</Button>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader><CardTitle>PhilHealth Payments</CardTitle></CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{formatCurrency(totals.philhealth.ee + totals.philhealth.er)}</p>
                          <Button className="w-full mt-4" variant="outline"><Download className="mr-2 h-4 w-4"/> Download Voucher</Button>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader><CardTitle>Pag-IBIG & BIR</CardTitle></CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{formatCurrency(totals.pagibig.ee + totals.pagibig.er + totals.tax)}</p>
                          <Button className="w-full mt-4" variant="outline"><Download className="mr-2 h-4 w-4"/> Download Voucher</Button>
                      </CardContent>
                  </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
