# Toast Migration Guide

## How to Replace alert() with Toast

### Step 1: Import useToastContext
```javascript
import { useToastContext } from '../../context/ToastContext';
```

### Step 2: Initialize toast in component
```javascript
const MyComponent = () => {
  const toast = useToastContext();
  // ... rest of component
}
```

### Step 3: Replace alert() calls

**Before:**
```javascript
alert('Student created successfully');
alert('Error saving student');
```

**After:**
```javascript
toast.success('Student created successfully! 🎉');
toast.error('Failed to save student');
```

## Toast Types

- `toast.success(message)` - Green success notification
- `toast.error(message)` - Red error notification  
- `toast.warning(message)` - Yellow warning notification
- `toast.info(message)` - Blue info notification

## Examples

### Success Messages
```javascript
toast.success('Student created successfully! 🎉');
toast.success('Data saved successfully');
toast.success('Operation completed');
```

### Error Messages
```javascript
toast.error('Failed to save student');
toast.error(error.response?.data?.message || 'Operation failed');
toast.error('Please fill in all required fields');
```

### Warning Messages
```javascript
toast.warning('Please select a class first');
toast.warning('This action cannot be undone');
```

### Info Messages
```javascript
toast.info('Loading data...');
toast.info('Processing your request');
```

## Files Already Updated
- ✅ frontend/src/pages/admin/Students.jsx
- ✅ frontend/src/App.jsx (ToastProvider added)
- ✅ frontend/src/index.css (animations added)

## Files Pending Update
See grep search results for all files with alert() calls that need updating.
