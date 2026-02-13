# Troubleshooting Vercel Deployment

## Common Issues and Solutions

### Issue: PDF Upload Stops Working After Deployment

**Symptoms:**
- Works locally but fails on Vercel
- File uploads but nothing happens
- No error messages visible

**Solutions:**

#### 1. Check Browser Console
Open Developer Tools (F12) and check the Console tab for errors:
- PDF.js loading errors
- Worker initialization errors
- CORS errors
- CSP (Content Security Policy) violations

#### 2. Clear Browser Cache
After redeployment:
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

#### 3. Test with Different PDFs
- Try a simple text PDF first
- Avoid scanned PDFs (images)
- Avoid password-protected PDFs

#### 4. Check Vercel Deployment Logs
```bash
vercel logs <deployment-url>
```

#### 5. Verify CDN Resources
Ensure these load successfully:
- https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
- https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
- https://cdn.tailwindcss.com

#### 6. Test Speech API Support
Some browsers/devices have limited Web Speech API support:
- Works: Chrome, Edge, Safari (14.1+)
- Limited: Firefox (requires about:config changes)
- Not Supported: Older browsers

### Issue: No Voices Available

**Solution:**
Wait a few seconds after page load. Voices load asynchronously.

### Issue: Word Highlighting Not Syncing

**Possible Causes:**
- Browser-specific Speech API implementation differences
- Voice selection (some voices have better boundary events)

**Solution:**
Try a different voice from the dropdown.

### Issue: CORS Errors

**Solution:**
Vercel automatically handles CORS for static files. If you see CORS errors:
1. Check that CDN URLs use HTTPS
2. Verify vercel.json headers are properly configured
3. Redeploy: `vercel --prod`

### Manual Testing Checklist

1. ✅ Open deployed URL
2. ✅ Check browser console (no errors)
3. ✅ Upload a simple text PDF
4. ✅ See loading indicator appear
5. ✅ See success message
6. ✅ See playback section appear
7. ✅ Select a voice
8. ✅ Click Play
9. ✅ Hear audio and see highlighting

### Debugging Tips

**Enable Verbose Logging:**
Open browser console and run:
```javascript
localStorage.setItem('debug', 'true');
```

**Check PDF.js Worker:**
```javascript
console.log(pdfjsLib.GlobalWorkerOptions.workerSrc);
```

**Check Available Voices:**
```javascript
console.log(speechSynthesis.getVoices());
```

**Test Speech API:**
```javascript
const utterance = new SpeechSynthesisUtterance('Hello world');
speechSynthesis.speak(utterance);
```

## Still Having Issues?

1. Check GitHub Issues for similar problems
2. Open browser DevTools and capture:
   - Console errors
   - Network tab (failed requests)
   - Application tab (localStorage, errors)
3. Create a GitHub issue with:
   - Browser and version
   - Error messages
   - Steps to reproduce
   - Sample PDF (if possible)

## Performance Optimization

For large PDFs on Vercel:
- Processing happens client-side (no server limits)
- Memory usage depends on PDF size
- Consider chunking very large files
- Use PDF.js rendering options for optimization
