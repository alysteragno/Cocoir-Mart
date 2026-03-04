'use client'
import { useEffect, useRef } from 'react'

export default function HomeAnimations() {
  const observed = useRef<Set<Element>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    // Observe all elements with data-animate attribute
    const targets = document.querySelectorAll('[data-animate]')
    targets.forEach((el) => {
      if (!observed.current.has(el)) {
        observer.observe(el)
        observed.current.add(el)
      }
    })

    return () => observer.disconnect()
  }, [])

  return null // pure side-effect component, renders nothing
}