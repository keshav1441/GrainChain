# Profile Edit and Verification Features

This implementation adds comprehensive profile editing and document verification functionality to the GrainChain platform.

## Features Added

### 1. Edit Profile Feature
- **Complete profile editing modal** with role-specific fields
- **Basic Information**: Name, phone, address, city, state, PIN code
- **Profile picture upload** with drag-and-drop support
- **Role-specific fields**:
  - **Farmers**: Farm details, crop information, banking details
  - **Buyers**: Company information, GST/PAN details, procurement preferences  
  - **Financiers**: Institution details, contact information, business metrics

### 2. Document Verification System
- **Role-based verification requirements**:
  - **Farmers**: Land documents, photo with land, address proof, Aadhar, PAN
  - **Financiers**: Aadhar, PAN, company registration documents
  - **Buyers**: No verification required
- **Document upload** with validation and progress tracking
- **Verification status tracking** with real-time updates
- **Manual verification workflow** with admin review process

### 3. Enhanced UI Components
- **Modal component** for popups and forms
- **File upload component** with drag-and-drop, validation, and preview
- **Dynamic verification status displays** with appropriate colors and icons
- **Responsive design** that works on all screen sizes

## Backend Implementation

### API Endpoints Added

```
PUT  /api/v1/users/profile/update          # Update user profile
POST /api/v1/users/documents/upload        # Upload documents
POST /api/v1/users/verification/farmer/submit     # Submit farmer verification
POST /api/v1/users/verification/financier/submit  # Submit financier verification  
GET  /api/v1/users/verification/status     # Get verification status
```

### Database Models Enhanced
- Extended user models with verification document fields
- Added document verification status tracking
- Role-specific profile information storage

## Frontend Components Added

### Core Components
- `EditProfileModal.tsx` - Comprehensive profile editing
- `VerificationModal.tsx` - Document verification interface
- `FileUpload.tsx` - Reusable file upload component
- `Modal.tsx` - Reusable modal wrapper

### Enhanced ProfilePage
- Integrated modal triggers
- Dynamic verification status display
- Role-based UI adaptations
- Real-time status updates

## How to Test

### 1. Backend Setup
```bash
# Start the FastAPI backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup  
```bash
# Start the React frontend
cd frontend
npm start
```

### 3. Testing Profile Edit
1. Navigate to the Profile page
2. Click "Edit Profile" button
3. Update personal information
4. Add role-specific details based on user type
5. Upload a profile picture
6. Save changes and verify updates

### 4. Testing Verification System

#### For Farmers:
1. Click "Manage Verification" or "Start Verification"
2. Upload required documents:
   - Land ownership documents
   - Photo with your farm/land
   - Address proof
   - Aadhar card
   - PAN card
3. Submit for verification
4. Check status updates

#### For Financiers:
1. Click "Manage Verification"
2. Upload required documents:
   - Aadhar card
   - PAN card  
   - Company registration documents
3. Submit for verification
4. Monitor verification status

#### For Buyers:
- No verification required - appropriate message displayed

### 5. Verification Status Flow

The system shows different messages based on verification status:
- **Not Submitted**: Blue notice with "Start Verification" button
- **Submitted/Under Review**: Yellow notice with submission date
- **Approved**: Green success notice
- **Rejected**: Red notice with "Resubmit Documents" button

## Technical Implementation Details

### File Upload System
- Supports multiple file types: PDF, JPG, JPEG, PNG, DOC, DOCX
- Client-side validation for file size (default 10MB limit)
- Drag-and-drop interface
- Preview and remove functionality

### Security Considerations
- All API calls use JWT authentication
- File uploads are validated on both client and server
- Document URLs are stored securely
- Manual admin verification prevents automated approval

### Error Handling
- Comprehensive error messages for failed uploads
- Network error handling with retry options
- Form validation with inline error displays
- Graceful degradation for API failures

## Future Enhancements

1. **Document OCR**: Automatic text extraction from documents
2. **Real-time notifications**: Push notifications for status changes
3. **Batch document upload**: Multiple file selection
4. **Document templates**: Guidance for proper document formats
5. **Admin verification dashboard**: Interface for manual verification
6. **Audit trail**: Complete verification history tracking

## API Response Examples

### Verification Status Response
```json
{
  "status": "submitted",
  "submitted_at": "2024-01-15T10:30:00Z",
  "message": "Your verification documents have been submitted and are under review. You will receive an update within 2-5 working days."
}
```

### Document Upload Response
```json
{
  "file_url": "/uploads/documents/user123_aadhar_abc123.pdf",
  "file_name": "aadhar_card.pdf",
  "document_type": "aadhar_card",
  "uploaded_at": "2024-01-15T10:25:00Z",
  "status": "submitted"
}
```

This implementation provides a complete, production-ready profile management and verification system that enhances user experience while maintaining security and compliance requirements.
