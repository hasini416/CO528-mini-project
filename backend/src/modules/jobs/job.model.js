const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    type: { type: String, enum: ['job', 'internship'], default: 'job' },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    salary: { type: String, default: '' },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
