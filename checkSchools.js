const mongoose = require('mongoose');
const School = require('./models/School');
const User = require('./models/User');
require('dotenv').config();

async function checkSchools() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/njyag');
        console.log('Connected to MongoDB');

        // Find all schools
        const schools = await School.find().populate('registeredBy', 'firstName lastName email');
        
        console.log(`Found ${schools.length} schools in database:`);
        
        schools.forEach((school, index) => {
            console.log(`\n${index + 1}. ${school.schoolName}`);
            console.log(`   Status: ${school.status}`);
            console.log(`   Registered by: ${school.registeredBy?.firstName} ${school.registeredBy?.lastName} (${school.registeredBy?.email})`);
            console.log(`   Students: ${school.numberOfStudents}`);
            console.log(`   Members: ${school.people.length}`);
            console.log(`   Created: ${new Date(school.createdAt).toLocaleDateString()}`);
            
            if (school.status === 'pending') {
                console.log(`   ✅ READY FOR APPROVAL`);
            }
        });

        const pendingSchools = schools.filter(s => s.status === 'pending');
        const approvedSchools = schools.filter(s => s.status === 'approved');
        
        console.log(`\nSUMMARY:`);
        console.log(`  Pending schools: ${pendingSchools.length}`);
        console.log(`  Approved schools: ${approvedSchools.length}`);

    } catch (error) {
        console.error('Error checking schools:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkSchools(); 