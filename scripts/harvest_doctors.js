const fs = require('fs');
const path = require('path');

const doctorsDir = path.join(__dirname, '../doctors');
const outputFile = path.join(__dirname, '../js/doctor-data.js');

const files = fs.readdirSync(doctorsDir);

const doctors = [];

files.forEach((file, index) => {
    if (path.extname(file) !== '.html') return;

    const content = fs.readFileSync(path.join(doctorsDir, file), 'utf8');

    // Extract Name
    const nameMatch = content.match(/<h1>(.*?)<\/h1>/);
    const name = nameMatch ? nameMatch[1].trim() : file.replace('.html', '');

    // Extract Title/Role
    const titleMatch = content.match(/<p class="doctor-title">(.*?)<\/p>/);
    let role = titleMatch ? titleMatch[1].trim() : 'Specialist';
    // Clean up role (remove "CONSULTANT -" etc if desireable, but user might want full text)
    // Keeping it simple for now.

    // Extract Department (Specialities)
    // Looking for: <div class="info-label">Specialities</div>\s*<div class="info-value">(.*?)</div>
    const deptMatch = content.match(/<div class="info-label">\s*Specialities\s*<\/div>\s*<div class="info-value">\s*(.*?)\s*<\/div>/s);
    let department = deptMatch ? deptMatch[1].trim() : 'General';

    // Normalize Department
    if (department.includes('Cardiol')) department = 'Cardiology';
    else if (department.includes('Neuro')) department = 'Neurology';
    else if (department.includes('Orthoped')) department = 'Orthopedics';
    else if (department.includes('Gyneco') || department.includes('Gynae')) department = 'Gynecology';
    else if (department.includes('Pediatri') || department.includes('Child')) department = 'Pediatrics';
    else if (department.includes('Derma') || department.includes('Skin')) department = 'Dermatology';
    else if (department.includes('Surge') || department.includes('Surgery')) department = 'Surgery';
    else if (department.includes('Medicine')) department = 'Internal Medicine';


    // Extract Image - target the one with class="doctor-image"
    // Regex matches <img ... class="doctor-image" ... src="../(img/...)" ... > OR <img ... src="../(img/...)" ... class="doctor-image" ... >
    // Since attributes can be in any order, simpler to find the tag with that class and extract src.
    const imgTagMatch = content.match(/<img[^>]*class="doctor-image"[^>]*>/);
    let image = 'img/default-doctor.jpg';

    if (imgTagMatch) {
        const srcMatch = imgTagMatch[0].match(/src="\.\.\/(img\/.*?)"/);
        if (srcMatch) {
            image = srcMatch[1];
        }
    } else {
        // Fallback: Try to find image in doctor-header div if class is missing (some files might vary)
        const headerMatch = content.match(/<div class="doctor-header">([\s\S]*?)<\/div>/);
        if (headerMatch) {
            const subImgMatch = headerMatch[1].match(/src="\.\.\/(img\/.*?)"/);
            if (subImgMatch) image = subImgMatch[1];
        }
    }

    // Extract Fee
    const feeMatch = content.match(/<div class="info-label">\s*Consultation Fee\s*<\/div>\s*<div class="info-value">\s*(.*?)\s*<\/div>/s);
    const fee = feeMatch ? feeMatch[1].trim() : 'N/A';

    doctors.push({
        id: `doc-${index + 1}`,
        filename: `doctors/${file}`,
        name,
        department,
        role,
        image,
        fee
    });
});

const fileContent = `window.initialDoctors = ${JSON.stringify(doctors, null, 4)};\n`;

fs.writeFileSync(outputFile, fileContent);
console.log(`Generated data for ${doctors.length} doctors.`);
