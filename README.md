# NutriTrack - Nutrition Tracking Web Application

NutriTrack is a comprehensive nutrition tracking web application built with Next.js and TypeScript. It allows users to track their daily food intake, exercise activities, and health metrics in a clean, intuitive interface.

![NutriTrack Dashboard](/placeholder.svg?height=400&width=800)

## Features

- **Daily Nutrition Dashboard**: Track calories, macronutrients (protein, carbs, fat) with visual progress indicators
- **Food Database**: Search and add foods from a comprehensive database
- **Custom Foods**: Add your own custom foods and recipes
- **Exercise Tracking**: Log various types of exercises with calorie burn calculations
- **Health Metrics**: Monitor weight, body fat percentage, and other health metrics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling and responsive design
- **shadcn/ui**: Component library for consistent UI elements
- **Lucide React**: For beautiful icons
- **Canvas API**: For custom charts and visualizations

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/nutritrack.git
   cd nutritrack
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

\`\`\`
nutritrack/
├── app/                  # Next.js app directory
│   ├── page.tsx          # Dashboard page
│   ├── food/             # Food tracking pages
│   └── exercise/         # Exercise tracking pages
├── components/           # Reusable components
│   ├── ui/               # UI components from shadcn
│   ├── food-item.tsx     # Food item component
│   ├── exercise-item.tsx # Exercise item component
│   └── ...               # Other components
├── public/               # Static assets
└── ...                   # Configuration files
\`\`\`

## Usage

### Dashboard

The dashboard provides an overview of your daily nutrition intake, recent meals, and exercise activities. You can:

- View your calorie and macronutrient progress
- Add new food entries
- Track health metrics
- See recent exercise activities

### Food Tracking

The food page allows you to:

- Search for foods in the database
- Add custom foods
- Create and save recipes
- View recently used foods
- Add food items to your daily log

### Exercise Tracking

The exercise page enables you to:

- Browse different exercise categories
- Add custom exercises
- Log exercise activities
- View calorie burn estimates
- Track exercise history

## Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the appearance by modifying the `tailwind.config.js` file.

### Adding New Features

To add new features:

1. Create new components in the `components` directory
2. Add new pages in the `app` directory
3. Update the navigation to include your new pages

## Data Management

NutriTrack currently uses client-side state management. To implement persistent data storage:

1. **Local Storage**: For simple offline storage
   \`\`\`javascript
   // Save data
   localStorage.setItem('nutritrack_data', JSON.stringify(data));
   
   // Retrieve data
   const data = JSON.parse(localStorage.getItem('nutritrack_data') || '{}');
   \`\`\`

2. **Database Integration**: For a production application, consider integrating:
   - Supabase
   - Firebase
   - MongoDB
   - PostgreSQL

## Authentication

To implement user authentication:

1. Use Next.js built-in authentication with NextAuth.js
2. Create login/signup pages in the `app/auth` directory
3. Implement protected routes for user-specific data

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure your project settings
4. Deploy

### Other Hosting Options

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Heroku

## Performance Optimization

- Use Next.js Image component for optimized images
- Implement code splitting for larger components
- Use React.memo for components that render frequently
- Optimize API calls with SWR or React Query

## Accessibility

NutriTrack is built with accessibility in mind:

- Semantic HTML elements
- ARIA attributes where necessary
- Keyboard navigation support
- Screen reader friendly content
- Color contrast compliance

## Browser Support

NutriTrack supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **Installation Problems**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Build Errors**
   - Check for TypeScript errors: `npm run type-check`
   - Verify import paths are correct

3. **Rendering Issues**
   - Check browser console for errors
   - Verify component props are correct

## Future Enhancements

- User authentication and profiles
- Data visualization and progress reports
- Meal planning and grocery lists
- Barcode scanner for easy food entry
- Social sharing and community features
- Mobile app using React Native
- Integration with fitness trackers and wearables
- AI-powered meal recommendations
- Nutritional goal setting and tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

\`\`\`
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
\`\`\`

## Acknowledgments

- Design inspired by modern nutrition tracking applications
- Food database information based on common nutritional data
- Exercise calorie calculations based on standard metabolic equivalents
- Thanks to the Next.js and React communities for their excellent documentation and support
- Special thanks to all contributors who have helped improve this project

---

Created with ❤️ using Next.js and TypeScript
