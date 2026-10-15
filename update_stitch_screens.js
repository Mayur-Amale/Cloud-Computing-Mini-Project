const fs = require('fs');
const path = require('path');

const STITCH_DIR = path.join(__dirname, 'stitch_student_drive_academic_portal');

const MAROON_TAILWIND_COLORS = `"tertiary": "#845e17", "on-tertiary": "#ffffff", "surface-container-lowest": "#ffffff", "on-primary-fixed": "#3d000d", "on-error-container": "#93000a", "on-secondary": "#ffffff", "primary-fixed-dim": "#f8c7d0", "on-surface-variant": "#544648", "on-tertiary-fixed-variant": "#5a3e18", "on-primary-container": "#fff0f2", "outline-variant": "#cfc0c2", "inverse-on-surface": "#faeef0", "inverse-surface": "#2d1a1d", "primary": "#800020", "on-primary-fixed-variant": "#68051e", "inverse-primary": "#f8c7d0", "on-tertiary-fixed": "#291800", "surface-variant": "#ebdcdc", "surface-tint": "#800020", "on-primary": "#ffffff", "surface": "#fcf9f9", "on-tertiary-container": "#291800", "primary-fixed": "#fce4e7", "on-secondary-fixed-variant": "#43383a", "outline": "#7d6e70", "background": "#fcf9f9", "secondary-fixed-dim": "#ddced0", "surface-container-highest": "#e6d7d9", "secondary-container": "#f4e8ea", "on-secondary-container": "#4a3e40", "surface-container": "#f4ebec", "tertiary-container": "#c59b27", "secondary": "#5c5052", "on-secondary-fixed": "#251d1e", "on-surface": "#1f1617", "on-error": "#ffffff", "surface-container-high": "#eee2e3", "primary-container": "#941b31", "on-background": "#1f1617", "secondary-fixed": "#f4e8ea", "surface-dim": "#e8dada", "surface-container-low": "#faf3f4", "error-container": "#ffdad6", "surface-bright": "#ffffff", "tertiary-fixed-dim": "#edd084", "error": "#ba1a1a", "tertiary-fixed": "#fbf3db"`;

const OLD_COLORS_REGEX = /"colors":\s*\{[^}]+(?:tertiary|primary)[^}]+\}/;

const screens = [
  '1._login_desktop',
  '2._student_dashboard_desktop',
  '3._subject_and_assignments_desktop',
  '4._assignment_upload_page_desktop',
  '5._student_submission_details_desktop',
  '6._teacher_dashboard_desktop',
  '7._teacher_review_page_desktop'
];

screens.forEach(screenName => {
  const filePath = path.join(STITCH_DIR, screenName, 'code.html');
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace Tailwind Colors
  content = content.replace(OLD_COLORS_REGEX, `"colors": { ${MAROON_TAILWIND_COLORS} }`);

  // 2. Replace hardcoded blue SVGs
  content = content.replace(/stroke="#004ac6"/g, 'stroke="#800020"');
  content = content.replace(/fill="#004ac6"/g, 'fill="#800020"');

  // 3. Replace remote images
  content = content.replace(
    /https:\/\/lh3\.googleusercontent\.com\/aida-public\/AB6AXuBB5qqIlkW1fC1ZtNM85SzPJh4bX-[^"')]+/g,
    '../../public/images/image-1.jpg'
  );
  content = content.replace(
    /https:\/\/lh3\.googleusercontent\.com\/aida-public\/AB6AXuCGQa78DoaPoi6Wz88zqNWgbj3QWnbrdE8Q8ENMpY20OvI29H7exoF9djeSepUX1zLtfwy31Zl7T5tJ8W9OTftYn2OAn3t-Np7fDNjTpmFye1wnLVMjy-9_b0LdQqTf6e-dpF-j34appfosJg_rXz1aFNp5auVPQ3t6eo-BJUHYkG86i7Oh5KmklYkYfJIIr_IEWblCP7Jou3wZVXdNIBLLLFlX4vEx2TSg8HPlkJe9UwyWbfnvOgJjJw/g,
    '../../public/images/image-2.jpg'
  );
  content = content.replace(
    /https:\/\/lh3\.googleusercontent\.com\/aida-public\/AB6AXuA-nf6BHnxacDM6VakxSmkoHrofzTaoSImgYFLwzSFJ9MaZhAOWwDOYK2z-A-f_Z_rcPgjDE_JdbjvRGw3w2ZUnZV6rnFK6I1UzC8c2CFeL9U3n8jRRyT7VOVWIiuoLz3p-j0HLBBq7kXxUHeqjuUCf29jFw70hY6SGibbrk7x36x0D7vN38Fz7-5hBrIR4dkGFC5CbShjYee0GY0l6HjnwKqvWn6TLGI1lPjzsWMXs7vbec_jdDTdqEw/g,
    '../../public/images/image-2.jpg'
  );

  // 4. Replace School logo icon in Sidebar with actual DYP DPU Logo
  content = content.replace(
    /<div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-md text-headline-md"><span class="material-symbols-outlined text-\[20px\]">school<\/span><\/div>/g,
    '<img src="../../public/images/logo.png" alt="DYP DPU Logo" class="h-9 w-9 object-contain bg-white rounded p-0.5 border border-surface-container-high shadow-xs"/>'
  );

  // 5. Wire up navigation links
  content = content.replace(/data-path="student-dashboard" href="#"/g, 'data-path="student-dashboard" href="../2._student_dashboard_desktop/code.html"');
  content = content.replace(/data-path="subject-and-assignments" href="#"/g, 'data-path="subject-and-assignments" href="../3._subject_and_assignments_desktop/code.html"');
  content = content.replace(/data-path="student-submission-details" href="#"/g, 'data-path="student-submission-details" href="../5._student_submission_details_desktop/code.html"');
  content = content.replace(/data-path="assignment-upload-page" href="#"/g, 'data-path="assignment-upload-page" href="../4._assignment_upload_page_desktop/code.html"');
  content = content.replace(/data-path="teacher-dashboard" href="#"/g, 'data-path="teacher-dashboard" href="../6._teacher_dashboard_desktop/code.html"');
  content = content.replace(/data-path="teacher-review-page" href="#"/g, 'data-path="teacher-review-page" href="../7._teacher_review_page_desktop/code.html"');
  content = content.replace(/data-path="login" href="#"/g, 'data-path="login" href="../1._login_desktop/code.html"');

  // In login screen 1, update logo icon & form action
  if (screenName === '1._login_desktop') {
    content = content.replace(
      /<div class="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-md shadow-primary\/20">\s*<span class="material-symbols-outlined text-2xl">school<\/span>\s*<\/div>/g,
      '<img src="../../public/images/logo.png" alt="DYP DPU Logo" class="h-11 w-11 object-contain bg-white rounded-lg p-1 shadow-md shadow-maroon-900/30"/>'
    );
    // Add link to dashboard on submit
    content = content.replace(
      /<form class="flex flex-col gap-5" onsubmit="event.preventDefault\(\);"/g,
      '<form class="flex flex-col gap-5" onsubmit="event.preventDefault(); window.location.href=\'../2._student_dashboard_desktop/code.html\';"'
    );
  }

  // Add a top banner linking back to the unified app
  const unifiedBanner = `<div style="background-color: #800020; color: #fff; padding: 6px 16px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; z-index: 9999; position: relative;">
    <span>DYP DPU Student Drive • Screen Template: <strong>${screenName}</strong> (College Maroon, White & Gold Theme)</span>
    <a href="../../index.html" style="background-color: #c59b27; color: #1a0f00; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-decoration: none;">Launch Unified Responsive Web App →</a>
  </div>`;

  if (!content.includes('Launch Unified Responsive Web App')) {
    content = content.replace('<body', unifiedBanner + '<body');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${screenName}/code.html successfully.`);
});
