const mongoose = require('mongoose');
require('dotenv').config();

const Doctor = require('./models/Doctor');
const Department = require('./models/Department');

const initialDepartments = [
    {
        name: "Cardiology",
        description: "Our Cardiology department is dedicated to providing comprehensive care for patients with heart and vascular conditions. We utilize state-of-the-art technology and evidence-based treatments.",
        image: "img/Cardiology.png",
        icon: "fas fa-heartbeat",
        services: ["Cardiac Consultations", "ECG & Echocardiography", "Interventional Cardiology", "Cardiac Rehabilitation"]
    },
    {
        name: "Neurology",
        description: "Our Neurology department offers specialized diagnosis and treatment for disorders of the nervous system, including the brain, spinal cord, nerves, and muscles.",
        image: "img/Neurology.png",
        icon: "fas fa-brain",
        services: ["Neurological Consultations", "Stroke Management", "Epilepsy Treatment", "Migraine & Headache Care"]
    },
    {
        name: "Orthopedics",
        description: "Our Orthopedics department provides expert care for bone, joint, ligament, tendon, and muscle conditions, helping you regain mobility and live pain-free.",
        image: "img/Orthopedics.png",
        icon: "fas fa-bone",
        services: ["Joint Replacement", "Sports Medicine", "Fracture & Trauma Care", "Pediatric Orthopedics"]
    },
    {
        name: "Gynecology",
        description: "Our Gynecology department delivers compassionate and comprehensive healthcare for women at every stage of life, prioritizing their health and comfort.",
        image: "img/Gynecology.png",
        icon: "fas fa-female",
        services: ["Prenatal & Postnatal Care", "High-Risk Pregnancy Care", "Laparoscopic Gyne Surgery", "Family Planning Services"]
    },
    {
        name: "Pediatrics",
        description: "Our Pediatrics department is dedicated to the physical, emotional, and social health of children from birth through adolescence.",
        image: "img/Pediatrics.png",
        icon: "fas fa-baby",
        services: ["General Pediatric Care", "Immunization & Vaccination", "Child Development Assessment", "Pediatric Asthma Management"]
    },
    {
        name: "Dermatology",
        description: "Our Dermatology department offers advanced clinical skin care and cosmetic treatments for acne, aging, and various skin disorders.",
        image: "img/Dermatology.png",
        icon: "fas fa-allergies",
        services: ["Clinical Dermatology", "Dermatosurgery", "Cosmetic Skin Treatments", "Laser Therapy"]
    },
    {
        name: "Surgery",
        description: "Our General Surgery department provides a wide range of surgical interventions with focus on patient safety, precision, and quick recovery.",
        image: "img/Surgery.png",
        icon: "fas fa-briefcase-medical",
        services: ["Abdominal Surgery", "Laparoscopic Surgery", "Hernia Repair", "Soft Tissue Surgery"]
    },
    {
        name: "Internal Medicine",
        description: "Our Internal Medicine department offers comprehensive care for acute and chronic internal diseases, focusing on personalized treatment plans.",
        image: "img/Internal_Medicine.png",
        icon: "fas fa-stethoscope",
        services: ["Chronic Disease Management", "Geriatric Medicine", "Infectious Diseases Care", "Preventive Health Screening"]
    }
];

const initialDoctors = [
    {
        "name": "Dr. Adiba Jannat Zara",
        "department": "Cardiology",
        "role": "CONSULTANT -Cardiologist (Heart Specialist)",
        "image": "img/team-1.jpg",
        "fee": "1200",
        "bio": "Dr. Adiba Jannat Zara is a highly experienced Cardiologist specializing in interventional cardiology and heart failure management. With over 10 years of clinical experience, she is dedicated to providing comprehensive cardiac care.",
        "schedule": "Sat, Mon, Wed: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Ahmed Safwan",
        "department": "Cardiology",
        "role": "CONSULTANT -Cardiologist (Heart Specialist)",
        "image": "img/team1.6.png",
        "fee": "1200",
        "bio": "Dr. Ahmed Safwan is a renowned Heart Specialist known for his expertise in arrhythmia management and preventive cardiology. He focuses on patient-centric care to improve heart health outcomes.",
        "schedule": "Sun, Tue, Thu: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr.Alvi Ahmed",
        "department": "Neurology",
        "role": "CONSULTANT -Neurologist",
        "image": "img/team1.2.png",
        "fee": "1200",
        "bio": "Dr. Alvi Ahmed is a leading Neurologist with expertise in treating stroke, epilepsy, and migraine. He is committed to providing advanced neurological care and rehabilitation support.",
        "schedule": "Sat, Mon, Wed: 6:00 PM - 9:00 PM"
    },
    {
        "name": "Dr. Apple Mahmud",
        "department": "Cardiology",
        "role": "CONSULTANT -Cardiologist (Heart Specialist)",
        "image": "img/t-8.png",
        "fee": "1200",
        "bio": "Dr. Apple Mahmud specializes in adult cardiology and non-invasive cardiac imaging. He is passionate about early detection and management of cardiovascular diseases.",
        "schedule": "Sun, Mon, Thu: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Arfa Hossain",
        "department": "Cardiology",
        "role": "CONSULTANT -Cardiologist (Heart Specialist)",
        "image": "img/team11.1.png",
        "fee": "1200",
        "bio": "Dr. Arfa Hossain is a dedicated Cardiologist with a focus on women's heart health and hypertension management. She believes in holistic care for long-term cardiovascular well-being.",
        "schedule": "Sat, Tue, Thu: 3:00 PM - 6:00 PM"
    },
    {
        "name": "Dr. Effat",
        "department": "Internal Medicine",
        "role": "CONSULTANT -Internal Medicine",
        "image": "img/t-6.png",
        "fee": "1200",
        "bio": "Dr. Effat is a seasoned specialist in Internal Medicine, treating a wide array of complex medical conditions. Her diagnostic skills and patient empathy make her a trusted physician.",
        "schedule": "Sat - Wed: 9:00 AM - 1:00 PM"
    },
    {
        "name": "Dr. Fahad Montasir",
        "department": "Internal Medicine",
        "role": "CONSULTANT -Internal Medicine",
        "image": "img/team10.2.png",
        "fee": "1200",
        "bio": "Dr. Fahad Montasir offers comprehensive care for acute and chronic internal diseases. He has a special interest in diabetes management and infectious diseases.",
        "schedule": "Sun, Tue, Thu: 10:00 AM - 2:00 PM"
    },
    {
        "name": "Dr. Imran Ahmed",
        "department": "Orthopedics",
        "role": "CONSULTANT -Orthopedic Surgeon",
        "image": "img/team1.3.png",
        "fee": "1200",
        "bio": "Dr. Imran Ahmed is a skilled Orthopedic Surgeon specializing in trauma and joint replacement surgeries. He is dedicated to helping patients regain mobility and live pain-free lives.",
        "schedule": "Mon, Wed, Fri: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr. Irfan Hossain",
        "department": "Neurology",
        "role": "CONSULTANT -Neurologist",
        "image": "img/team-4.jpg",
        "fee": "1200",
        "bio": "Dr. Irfan Hossain is an expert in neuro-degenerative disorders and neuromuscular diseases. He employs the latest diagnostic tools to provide precise treatment plans.",
        "schedule": "Sat, Tue, Thu: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Jonaki Khan",
        "department": "Gynecology",
        "role": "CONSULTANT -Gynecologist & Obstetrician",
        "image": "img/team1.8.png",
        "fee": "1200",
        "bio": "Dr. Jonaki Khan is a compassionate Gynecologist & Obstetrician with expertise in high-risk pregnancies and reproductive health. She prioritizes the health and comfort of mothers and babies.",
        "schedule": "Sat, Mon, Wed: 3:00 PM - 6:00 PM"
    },
    {
        "name": "Dr. Khusbu Akter",
        "department": "Dermatology",
        "role": "CONSULTANT -Dermatologist",
        "image": "img/team1.9.png",
        "fee": "1200",
        "bio": "Dr. Khusbu Akter is a leading Dermatologist specializing in cosmetic dermatology and clinical skin care. She offers advanced treatments for acne, aging, and skin disorders.",
        "schedule": "Sun, Tue, Thu: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Kohinur Mim",
        "department": "Pediatrics",
        "role": "CONSULTANT -Pediatrician (Child Specialist)",
        "image": "img/team10.png",
        "fee": "1200",
        "bio": "Dr. Kohinur Mim is a caring Pediatrician dedicated to the physical, emotional, and social health of children from birth through adolescence. She is an expert in child development.",
        "schedule": "Sat, Mon, Wed: 10:00 AM - 1:00 PM"
    },
    {
        "name": "Dr.Mahin Ahmed",
        "department": "Orthopedics",
        "role": "CONSULTANT -Orthopedic Surgeon",
        "image": "img/team10.1.png",
        "fee": "1200",
        "bio": "Dr. Mahin Ahmed specializes in sports medicine and arthroscopic surgery. He works closely with athletes and active individuals to treat injuries and enhance performance.",
        "schedule": "Sun, Tue, Thu: 6:00 PM - 9:00 PM"
    },
    {
        "name": "Dr. Mariya Akter",
        "department": "Pediatrics",
        "role": "CONSULTANT -Pediatrician (Child Specialist)",
        "image": "img/team11.2.png",
        "fee": "1200",
        "bio": "Dr. Mariya Akter provides compassionate care for newborns and children. Her areas of interest include pediatric nutrition, immunization, and infectious diseases.",
        "schedule": "Sun, Tue, Thu: 11:00 AM - 2:00 PM"
    },
    {
        "name": "Dr. Masfu Jahan",
        "department": "Pediatrics",
        "role": "CONSULTANT -Pediatrician (Child Specialist)",
        "image": "img/team10.5.png",
        "fee": "1200",
        "bio": "Dr. Masfu Jahan is an experienced Child Specialist known for her gentle approach. She specializes in respiratory illnesses and general pediatric care.",
        "schedule": "Sat, Mon, Wed: 2:00 PM - 5:00 PM"
    },
    {
        "name": "Dr. Masud Rana",
        "department": "Neurology",
        "role": "CONSULTANT -Neurologist",
        "image": "img/team-2.jpg",
        "fee": "1200",
        "bio": "Dr. Masud Rana is a Consultant Neurologist with expertise in movement disorders and spinal cord issues. He is dedicated to improving quality of life for neurological patients.",
        "schedule": "Sat, Mon, Thu: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr. MG Rakib",
        "department": "Orthopedics",
        "role": "CONSULTANT -Orthopedic Surgeon",
        "image": "img/team1.5.png",
        "fee": "1200",
        "bio": "Dr. MG Rakib is an expert in spinal surgery and complex fracture management. He utilizes minimally invasive techniques to ensure faster recovery for his patients.",
        "schedule": "Tue, Thu, Sat: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Mlilon Gazi",
        "department": "Orthopedics",
        "role": "CONSULTANT -Orthopedic Surgeon",
        "image": "img/team11.5.png",
        "fee": "1200",
        "bio": "Dr. Millon Gazi specializes in pediatric orthopedics and limb deformity correction. He is committed to providing specialized care for musculoskeletal conditions in children.",
        "schedule": "Sun, Tue, Wed: 3:00 PM - 6:00 PM"
    },
    {
        "name": "Dr.Oyeshee Jahan",
        "department": "Gynecology",
        "role": "CONSULTANT -Gynecologist & Obstetrician",
        "image": "img/team-3.jpg",
        "fee": "1200",
        "bio": "Dr. Oyeshee Jahan is a trusted name in women's health, offering expert care in prenatal, antenatal, and postnatal stages. She is also skilled in laparoscopic gynecological surgeries.",
        "schedule": "Sun, Tue, Thu: 2:00 PM - 5:00 PM"
    },
    {
        "name": "Dr. Pranto Ahmed",
        "department": "Internal Medicine",
        "role": "CONSULTANT -Internal Medicine",
        "image": "img/about2.png",
        "fee": "1200",
        "bio": "Dr. Pranto Ahmed is an Internal Medicine specialist with a focus on geriatrics and chronic disease management. He provides holistic treatment plans tailored to elderly patients.",
        "schedule": "Sat - Wed: 10:00 AM - 1:00 PM"
    },
    {
        "name": "Dr. Rabeya Akter",
        "department": "Dermatology",
        "role": "CONSULTANT -Dermatologist",
        "image": "img/t-7.png",
        "fee": "1200",
        "bio": "Dr. Rabeya Akter specializes in clinical dermatology and dermatosurgery. She is dedicated to treating skin infections, allergies, and providing aesthetic skin solutions.",
        "schedule": "Sat, Mon, Wed: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr. Shobnom Jahan",
        "department": "Dermatology",
        "role": "CONSULTANT -Dermatologist",
        "image": "img/team10.6.png",
        "fee": "1200",
        "bio": "Dr. Shobnom Jahan is an expert in laser treatments and cosmetic procedures. She combines medical expertise with aesthetic precision to deliver optimal skin care results.",
        "schedule": "Sun, Tue, Thu: 6:00 PM - 9:00 PM"
    },
    {
        "name": "Dr. Sumaiya Abrar",
        "department": "Gynecology",
        "role": "CONSULTANT -Gynecologist & Obstetrician",
        "image": "img/team1.1.png",
        "fee": "1200",
        "bio": "Dr. Sumaiya Abrar provides comprehensive gynecological care, including fertility treatments and menopausal management. She is dedicated to empowering women through health education.",
        "schedule": "Sat, Mon, Thu: 2:00 PM - 5:00 PM"
    },
    {
        "name": "Dr. Sumaiya Jahan",
        "department": "Pediatrics",
        "role": "CONSULTANT -Pediatrician (Child Specialist)",
        "image": "img/team10.7.png",
        "fee": "1200",
        "bio": "Dr. Sumaiya Jahan creates a friendly environment for children. She specializes in pediatric asthma and allergy management, ensuring children breathe easier and live healthier.",
        "schedule": "Sat, Mon, Wed: 3:00 PM - 6:00 PM"
    },
    {
        "name": "Dr. Tasin Ahmed",
        "department": "Neurology",
        "role": "CONSULTANT -Neurologist",
        "image": "img/team11.4.png",
        "fee": "1200",
        "bio": "Dr. Tasin Ahmed is a Neurologist with a research interest in cognitive disorders. He provides expert care for dementia, Alzheimer’s, and other memory-related conditions.",
        "schedule": "Sun, Tue, Thu: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr. Tisha Jahan",
        "department": "Surgery",
        "role": "CONSULTANT -General Surgery",
        "image": "img/team10.4.png",
        "fee": "1200",
        "bio": "Dr. Tisha Jahan is a skilled General Surgeon with expertise in abdominal and soft tissue surgeries. She is known for her precision and excellent post-operative care.",
        "schedule": "Sat, Mon, Wed: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Timon Biswas",
        "department": "Surgery",
        "role": "CONSULTANT -General Surgery",
        "image": "img/team1.7.png",
        "fee": "1200",
        "bio": "Dr. Timon Biswas specializes in laparoscopic and minimally invasive surgery. He is dedicated to providing surgical solutions with reduced recovery times and minimal scarring.",
        "schedule": "Sun, Tue, Thu: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Umme Hafsa",
        "department": "Dermatology",
        "role": "CONSULTANT -Dermatologist",
        "image": "img/team10.8.png",
        "fee": "1200",
        "bio": "Dr. Umme Hafsa focuses on pediatric dermatology and hereditary skin disorders. She provides specialized care for children with skin conditions, ensuring their comfort and health.",
        "schedule": "Sat, Mon, Thu: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr. Zakir hossain",
        "department": "Surgery",
        "role": "CONSULTANT -General Surgery",
        "image": "img/team11.3.png",
        "fee": "1200",
        "bio": "Dr. Zakir Hossain is an experienced surgeon specializing in hernia repair and gastrointestinal surgeries. He prioritizes patient safety and successful surgical outcomes.",
        "schedule": "Sun, Tue, Wed: 5:00 PM - 8:00 PM"
    },
    {
        "name": "Dr. Zubayer Ahmed",
        "department": "Surgery",
        "role": "CONSULTANT -General Surgery",
        "image": "img/team10.3.png",
        "fee": "1200",
        "bio": "Dr. Zubayer Ahmed offers expert care in trauma surgery and emergency surgical procedures. He is dedicated to saving lives and providing critical surgical interventions.",
        "schedule": "Mon, Wed, Sat: 4:00 PM - 7:00 PM"
    },
    {
        "name": "Dr.sadia Akter",
        "department": "Gynecology",
        "role": "CONSULTANT -Gynecologist & Obstetrician",
        "image": "img/t5.png",
        "fee": "1200",
        "bio": "Dr. Sadia Akter is a dedicated Women's Health specialist. She provides comprehensive care for adolescent gynecology and family planning services.",
        "schedule": "Sat, Tue, Thu: 3:00 PM - 6:00 PM"
    },
    {
        "name": "Dr. Tahsin Ahmed",
        "department": "Internal Medicine",
        "role": "CONSULTANT -Internal Medicine",
        "image": "img/team11.png",
        "fee": "1200",
        "bio": "Dr. Tahsin Ahmed is an Internal Medicine Consultant with a focus on preventive health and lifestyle disease management. He helps patients achieve optimal health through personalized care plans.",
        "schedule": "Mon, Wed, Thu: 10:00 AM - 1:00 PM"
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Seed Doctors
        for (const doc of initialDoctors) {
            const exists = await Doctor.findOne({ name: doc.name });
            if (!exists) {
                const newDoc = new Doctor(doc);
                await newDoc.save();
                console.log(`Seeded doctor: ${doc.name}`);
            }
        }

        // Seed Departments
        for (const dept of initialDepartments) {
            const exists = await Department.findOne({ name: dept.name });
            if (!exists) {
                const newDept = new Department(dept);
                await newDept.save();
                console.log(`Seeded department: ${dept.name}`);
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
