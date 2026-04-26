import React from "react";
import { Heart, Users, Shield, Zap, Award, Target } from "lucide-react";

const Biography = ({ imageUrl }) => {
  const features = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Putting patients at the heart of everything we do with compassionate, personalized healthcare solutions."
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Skilled healthcare professionals dedicated to providing exceptional medical care and support."
    },
    {
      icon: Shield,
      title: "Advanced Technology",
      description: "State-of-the-art medical equipment and cutting-edge technology for accurate diagnosis and treatment."
    },
    {
      icon: Zap,
      title: "Quick Response",
      description: "Efficient emergency services and rapid response times for critical medical situations."
    },
    {
      icon: Award,
      title: "Quality Standards",
      description: "Committed to maintaining the highest standards of healthcare quality and safety."
    },
    {
      icon: Target,
      title: "Community Health",
      description: "Dedicated to improving the health and wellness of our community through comprehensive care."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative">
            <img
              src={imageUrl}
              alt="About Us"
              className="w-full h-auto rounded-2xl shadow-2xl"
              style={{ maxHeight: "500px", objectFit: "cover" }}
            />
            
            {/* Floating Stats */}
            <div className="absolute top-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
              <div className="text-2xl font-bold text-blue-600">15+</div>
              <div className="text-sm text-gray-600">Years</div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              About Our Hospital
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Vasudev healthcare Medical Institute has been at the forefront of healthcare excellence for over 15 years. Our commitment to patient-centered care, combined with cutting-edge medical technology, makes us a trusted choice for families seeking comprehensive healthcare services.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Biography;
