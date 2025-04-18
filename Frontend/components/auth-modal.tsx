"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Mail, Lock, User, ChromeIcon as Google, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AuthModalProps {
  type: "login" | "signup"
  onClose: () => void
  onSwitchType: (type: "login" | "signup") => void
}

export default function AuthModal({ type, onClose, onSwitchType }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<"mentee" | "mentor" | "">("")
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)

  // Mentor profile fields
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [languages, setLanguages] = useState<string[]>([])
  const [communicationPreference, setCommunicationPreference] = useState<string>("")

  // Mentee profile fields
  const [interests, setInterests] = useState<string[]>([])
  const [goals, setGoals] = useState("")
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (type === "signup" && !showRoleSelection) {
      setShowRoleSelection(true)
      return
    }

    if (type === "signup" && showRoleSelection && !showProfileForm && userRole) {
      setShowProfileForm(true)
      return
    }

    setLoading(true)
    setError("")

    try {
      if (type === "login") {
        // Sign in with credentials
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        })

        if (result?.error) {
          setError("Invalid email or password")
        } else {
          onClose()
          router.refresh()
        }
      } else {
        // Register new user with role and profile data
        // In a real app, this would call an API endpoint

        const userData = {
          name,
          email,
          password,
          role: userRole,
          ...(userRole === "mentor"
            ? { bio, skills, experience, languages, communicationPreference }
            : { interests, goals, preferredLanguages }),
        }

        console.log("Registering user:", userData)

        // Simulate API call
        setTimeout(() => {
          onClose()

          // Redirect to appropriate dashboard
          if (userRole === "mentor") {
            router.push("/dashboard/mentor")
          } else {
            router.push("/dashboard/mentee")
          }
        }, 1000)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true)
    try {
      if (provider === "google") {
        // Firebase Google Auth Logic
        // In a real implementation, this would use Firebase SDK
        // import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
        //
        // const auth = getAuth();
        // const googleProvider = new GoogleAuthProvider();
        // const result = await signInWithPopup(auth, googleProvider);
        // const user = result.user;
        //
        // Then handle the authenticated user

        // For now, we'll simulate the process
        await signIn(provider, { callbackUrl: window.location.origin })
      }
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err)
      setError(`Error signing in with ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-center">I want to join as a:</h3>

      <RadioGroup value={userRole} onValueChange={(value) => setUserRole(value as "mentee" | "mentor")}>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`flex flex-col items-center p-4 rounded-lg border ${userRole === "mentee" ? "border-cyan-500 bg-cyan-950/20" : "border-gray-700"} cursor-pointer transition-all duration-200`}
            onClick={() => setUserRole("mentee")}
          >
            <GraduationCap className="h-10 w-10 mb-3 text-cyan-500" />
            <RadioGroupItem value="mentee" id="mentee" className="sr-only" />
            <Label htmlFor="mentee" className="text-lg font-medium cursor-pointer">
              Mentee
            </Label>
            <p className="text-sm text-gray-400 text-center mt-2">
              I'm looking for guidance and want to learn from experts
            </p>
          </div>

          <div
            className={`flex flex-col items-center p-4 rounded-lg border ${userRole === "mentor" ? "border-purple-500 bg-purple-950/20" : "border-gray-700"} cursor-pointer transition-all duration-200`}
            onClick={() => setUserRole("mentor")}
          >
            <Briefcase className="h-10 w-10 mb-3 text-purple-500" />
            <RadioGroupItem value="mentor" id="mentor" className="sr-only" />
            <Label htmlFor="mentor" className="text-lg font-medium cursor-pointer">
              Mentor
            </Label>
            <p className="text-sm text-gray-400 text-center mt-2">I want to share my knowledge and guide others</p>
          </div>
        </div>
      </RadioGroup>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={!userRole}
      >
        Continue
      </Button>
    </div>
  )

  const renderMentorProfileForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          placeholder="Share your professional background and expertise..."
          className="bg-gray-800 border-gray-700"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Areas of Expertise</Label>
        <Select onValueChange={(value) => setSkills((prev) => [...prev, value])}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select your skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
              {skill}
              <button className="ml-1" onClick={() => setSkills(skills.filter((_, i) => i !== index))}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Select onValueChange={setExperience}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select years of experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-3">1-3 years</SelectItem>
            <SelectItem value="4-6">4-6 years</SelectItem>
            <SelectItem value="7-10">7-10 years</SelectItem>
            <SelectItem value="10+">10+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="languages">Languages</Label>
        <Select onValueChange={(value) => setLanguages((prev) => [...prev, value])}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="mandarin">Mandarin</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {languages.map((language, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
              {language}
              <button className="ml-1" onClick={() => setLanguages(languages.filter((_, i) => i !== index))}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="communication">Preferred Communication Method</Label>
        <Select onValueChange={setCommunicationPreference}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select communication method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video Call</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={
          loading || !bio || skills.length === 0 || !experience || languages.length === 0 || !communicationPreference
        }
      >
        {loading ? "Creating account..." : "Complete Registration"}
      </Button>
    </div>
  )

  const renderMenteeProfileForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="interests">Areas of Interest</Label>
        <Select onValueChange={(value) => setInterests((prev) => [...prev, value])}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select your interests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((interest, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
              {interest}
              <button className="ml-1" onClick={() => setInterests(interests.filter((_, i) => i !== index))}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Learning Goals</Label>
        <Textarea
          id="goals"
          placeholder="What do you hope to achieve through mentorship?"
          className="bg-gray-800 border-gray-700"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredLanguages">Preferred Languages</Label>
        <Select onValueChange={(value) => setPreferredLanguages((prev) => [...prev, value])}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="mandarin">Mandarin</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {preferredLanguages.map((language, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
              {language}
              <button
                className="ml-1"
                onClick={() => setPreferredLanguages(preferredLanguages.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={loading || interests.length === 0 || !goals || preferredLanguages.length === 0}
      >
        {loading ? "Creating account..." : "Complete Registration"}
      </Button>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-70"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-gray-900 rounded-full border border-cyan-500 z-10">
              <span className="font-bold text-cyan-500 text-lg">C</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{type === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="text-gray-400 mt-1">
            {type === "login" ? "Sign in to your account" : "Join thousands of learners and mentors"}
          </p>
        </div>

        <Tabs defaultValue={type} onValueChange={(value) => onSwitchType(value as "login" | "signup")}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-gray-800 border-gray-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-gray-800 border-gray-700"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="border-gray-700 hover:bg-gray-800"
                  onClick={() => handleSocialSignIn("google")}
                  disabled={loading}
                >
                  <Google className="h-4 w-4 mr-2" />
                  Continue with Google
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              {!showRoleSelection && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-400">Password must be at least 8 characters long</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <a href="#" className="text-cyan-500 hover:text-cyan-400">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-cyan-500 hover:text-cyan-400">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {showRoleSelection && !showProfileForm && renderRoleSelection()}

              {showRoleSelection && showProfileForm && userRole === "mentor" && renderMentorProfileForm()}

              {showRoleSelection && showProfileForm && userRole === "mentee" && renderMenteeProfileForm()}
            </form>

            {!showRoleSelection && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800"
                    onClick={() => handleSocialSignIn("google")}
                    disabled={loading}
                  >
                    <Google className="h-4 w-4 mr-2" />
                    Continue with Google
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

