import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

import { FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import FileUpload from '../kokonutui/file-upload';

interface CSVUpload {
  id: string;
  filename: string;
  totalGuests: number;
  successfulImports: number;
  createdAt: string;
}

export const GuestsCsvUpload = ({
  fetchData,
  csvUploads,
}: {
  fetchData: () => void;
  csvUploads: CSVUpload[];
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/guests/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setUploadMessage({
          type: 'success',
          text: `CSV uploaded successfully! Processed ${data.processedRows} guests.`,
        });
        setSelectedFile(null);
        fetchData(); // Refresh stats
      } else {
        setUploadMessage({
          type: 'error',
          text: data.message || 'Upload failed. Please try again.',
        });
      }
    } catch (error) {
      setUploadMessage({
        type: 'error',
        text: 'Network error. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Guest List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FileUpload
            className="w-full"
            currentFile={selectedFile}
            onUploadSuccess={(file) => setSelectedFile(file)}
            onUploadError={() => console.log('error')}
            acceptedFileTypes={['.csv']}
            maxFileSize={10 * 1024 * 1024} // 10MB
          />
          <p className="text-sm text-gray-600">
            CSV format: firstName, lastName, email, phoneNumber, partySize,
            dietaryRestrictions, specialRequests
          </p>
          {uploadMessage && (
            <div
              className={`p-3 rounded-md ${
                uploadMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="text-sm">{uploadMessage.text}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            onClick={handleFileUpload}
            className="cursor-pointer w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </button>{' '}
          {csvUploads.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Uploads:</h4>
              <div className="space-y-2">
                {csvUploads.slice(0, 3).map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="text-sm">{upload.filename}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {upload.successfulImports}/{upload.totalGuests} imported
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
