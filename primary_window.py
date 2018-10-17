#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from tkinter import Frame, Tk, Button, CENTER, NSEW, font
import os
from coquinaria.utils import *


class Window(Frame):
    """Primary Window of the application"""
    def __init__(self):
        self.tk = Tk()
        self.tk.attributes('-fullscreen', True)
        self.tk.title("Choix Application")
        self.state = True
        self.tk.bind("<F11>", lambda _: toggle_fullscreen(self))
        self.tk.bind("<Escape>", lambda _: end_fullscreen(self))

        B1 = Button(self.tk,
                    text="Coquinaria",
                    command=self.coquinaria,
                    font=HUGE_FONT)
        B1.grid(row=1, column=1, sticky=NSEW)
        B2 = Button(self.tk,
                    text="Cognatio",
                    command=self.cognatio,
                    font=HUGE_FONT)
        B2.grid(row=2, column=1, sticky=NSEW)
        B3 = Button(self.tk,
                    text="Quitter",
                    command=lambda: exit(self),
                    font=HUGE_FONT)
        B3.grid(row=3, column=1, sticky=NSEW)

        self.tk.grid_rowconfigure(0, weight=1)
        self.tk.grid_rowconfigure(4, weight=1)
        self.tk.grid_columnconfigure(0, weight=1)
        self.tk.grid_columnconfigure(2, weight=1)

        for child in self.tk.winfo_children():
            child.grid_configure(padx=5, pady=5)

    def coquinaria(self):
        """Execute coquinaria"""
        exit(self)
        os.system('python3 coquinaria/coquinaria.py')

    def cognatio(self):
        """Execute cognatio"""
        popupmsg("Pas encore implémenté")
        # os.system('python3 cognatio/cognatio.py')

w = Window()
w.mainloop()
