import React from "react";
import { motion } from "framer-motion";
import { Heart, Brain, Bone, Eye, Stethoscope, Activity, Baby, Microscope, Radio } from "lucide-react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const Departments = () => {
  const departmentsArray = [
    {
      name: "Pediatrics",
      imageUrl: "/departments/pedia.jpg",
      icon: Baby,
      description: "Specialized care for infants, children, and adolescents",
      color: "from-pink-400 to-pink-600"
    },
    {
      name: "Orthopedics",
      imageUrl: "/departments/ortho.jpg",
      icon: Bone,
      description: "Bone, joint, and musculoskeletal care",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Cardiology",
      imageUrl: "/departments/cardio.jpg",
      icon: Heart,
      description: "Heart and cardiovascular system care",
      color: "from-red-400 to-red-600"
    },
    {
      name: "Neurology",
      imageUrl: "/departments/neuro.jpg",
      icon: Brain,
      description: "Brain, spinal cord, and nervous system care",
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "Oncology",
      imageUrl: "/departments/onco.jpg",
      icon: Activity,
      description: "Cancer diagnosis, treatment, and prevention",
      color: "from-green-400 to-green-600"
    },
    {
      name: "Radiology",
      imageUrl: "/departments/radio.jpg",
      icon: Radio,
      description: "Medical imaging and diagnostic services",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      name: "Physical Therapy",
      imageUrl: "/departments/therapy.jpg",
      icon: Activity,
      description: "Rehabilitation and physical recovery programs",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      name: "Dermatology",
      imageUrl: "/departments/derma.jpg",
      icon: Eye,
      description: "Skin, hair, and nail conditions treatment",
      color: "from-orange-400 to-orange-600"
    },
    {
      name: "ENT",
      imageUrl: "/departments/ent.jpg",
      icon: Stethoscope,
      description: "Ear, nose, and throat specialist care",
      color: "from-teal-400 to-teal-600"
    },
  ];

  const responsive = {
    extraLarge: {
      breakpoint: { max: 3000, min: 1324 },
      items: 4,
      slidesToSlide: 1, // optional, default to 1.
    },
    large: {
      breakpoint: { max: 1324, min: 1005 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    medium: {
      breakpoint: { max: 1005, min: 700 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
    small: {
      breakpoint: { max: 700, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Medical Departments
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive healthcare services across specialized departments with expert medical professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departmentsArray.map((depart, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`h-48 bg-gradient-to-br ${depart.color} flex items-center justify-center`}>
                <depart.icon className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{depart.name}</h3>
                <p className="text-gray-600 mb-4">{depart.description}</p>
                <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "50+", label: "Expert Doctors" },
            { number: "15+", label: "Departments" },
            { number: "10K+", label: "Happy Patients" },
            { number: "24/7", label: "Emergency Care" }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Departments;
