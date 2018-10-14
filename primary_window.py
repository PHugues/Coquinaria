#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from tkinter import Frame, Tk, Button, CENTER, NSEW, font
import os


class Window(Frame):
    """Primary Window of the application"""
    def __init__(self):
        self.tk = Tk()
        self.tk.attributes('-fullscreen', True)
        self.frame = Frame(self.tk)
        self.tk.title("Choix Application")
        self.state = True
        self.tk.bind("<F11>", self.toggle_fullscreen)
        self.tk.bind("<Escape>", self.end_fullscreen)
        font.nametofont('TkDefaultFont').configure(size=20)

        B1 = Button(self.frame, text="Coquinaria", command=self.coquinaria)
        B1.grid(row=1, column=1, sticky=NSEW)
        B2 = Button(self.frame, text="Cognatio", command=self.cognatio)
        B2.grid(row=2, column=1, sticky=NSEW)
        B3 = Button(self.frame, text="Quitter", command=self.exit)
        B3.grid(row=3, column=1, sticky=NSEW)

        self.frame.grid_rowconfigure(0, weight=1)
        self.frame.grid_rowconfigure(4, weight=1)
        self.frame.grid_columnconfigure(0, weight=1)
        self.frame.grid_columnconfigure(2, weight=1)

        for child in self.frame.winfo_children():
            child.grid_configure(padx=5, pady=5)

    def coquinaria(self):
        """Execute coquinaria"""
        self.exit()
        os.system('python3 coquinaria/coquinaria.py')

    def cognatio(self):
        """Execute cognatio"""
        self.exit()
        # os.system('python3 cognatio/cognatio.py')

    def toggle_fullscreen(self, event=None):
        """Toggle fullscreen mod when pressed F11"""
        self.state = not self.state  # Just toggling the boolean
        self.tk.attributes("-fullscreen", self.state)
        return "break"

    def end_fullscreen(self, event=None):
        """End fullscreen mod when pressed ESC"""
        self.state = False
        self.tk.attributes("-fullscreen", False)
        self.tk.attributes("-zoomed", True)
        return "break"

    def exit(self):
        """Close the window"""
        self.tk.destroy()

w = Window()
w.mainloop()
