import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

export default function ContractModal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center p-10">
      <Button onClick={() => setOpen(true)}>Store Signed Document</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-white rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Store a signed document
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="new" className="w-full mt-4">
            <TabsList className="mb-6 grid w-full grid-cols-2 gap-4">
              <TabsTrigger 
                value="new"
                className="flex items-center gap-2 border border-[#E3E7EA] py-4 text-[#7F868E] transition-colors data-[state=active]:border-[#0BA5EC] data-[state=active]:bg-[#E0F2FE] data-[state=active]:text-[#0BA5EC] hover:border-gray-300 hover:bg-gray-50 !cursor-pointer"
              >
                New Contract
              </TabsTrigger>
              <TabsTrigger 
                value="ongoing"
                className="flex items-center gap-2 border border-[#E3E7EA] py-4 text-[#7F868E] transition-colors data-[state=active]:border-[#0BA5EC] data-[state=active]:bg-[#E0F2FE] data-[state=active]:text-[#0BA5EC] hover:border-gray-300 hover:bg-gray-50 !cursor-pointer"
              >
                On-going Contract
              </TabsTrigger>
            </TabsList>

            {/* New Contract Tab */}
            <TabsContent value="new" className="mt-6">
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p>Drag and Drop files, or browse</p>
                <p className="text-xs text-gray-400">Allowed files: .docx, .pdf</p>
              </div>
            </TabsContent>

            {/* Ongoing Contract Tab */}
            <TabsContent value="ongoing" className="mt-6">
              <div className="mb-4">
                <select className="w-full border rounded-md p-2 text-gray-600">
                  <option>Select on-going contract</option>
                  <option>Contract A</option>
                  <option>Contract B</option>
                </select>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                <UploadCloud className="w-10 h-10 mb-2" />
                <p>Drag and Drop files, or browse</p>
                <p className="text-xs text-gray-400">Allowed files: .docx, .pdf</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
