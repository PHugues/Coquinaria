#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from tkinter import Frame, Tk, Button
import os


class Window(Frame):
    """Primary Window of the application"""
    def __init__(self):
        self.tk = Tk()
        self.tk.attributes('-fullscreen', True)
        self.frame = Frame(self.tk)
        self.tk.title("Choix Application")
        self.frame.pack()
        self.state = True
        self.tk.bind("<F11>", self.toggle_fullscreen)
        self.tk.bind("<Escape>", self.end_fullscreen)
        self.tk.configure(background='black')

        Button(self.frame, text="Coquinaria", command=self.coquinaria).grid(
            column=2, row=2)
        Button(self.frame, text="Cognatio", command=self.cognatio).grid(
            column=2, row=3)

        for child in self.frame.winfo_children():
            child.grid_configure(padx=5, pady=5)

    def coquinaria(self):
        """Execute coquinaria"""
        self.tk.destroy()
        os.system('python3 coquinaria/coquinaria.py')

    def cognatio(self):
        """Execute cognatio"""
        self.tk.destroy()
        # os.system('python3 cognatio/cognatio.py')

    def toggle_fullscreen(self, event=None):
        self.state = not self.state  # Just toggling the boolean
        self.tk.attributes("-fullscreen", self.state)
        return "break"

    def end_fullscreen(self, event=None):
        self.state = False
        self.tk.attributes("-fullscreen", False)
        self.tk.attributes("-zoomed", True)
        return "break"


w = Window()
w.mainloop()
