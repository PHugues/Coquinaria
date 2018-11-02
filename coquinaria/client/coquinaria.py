#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import getpass
import dbconfig
from tkinter import Frame, Tk, Button, CENTER, NSEW, font, Label
import utils

sys.path.insert(0, '../')
os.chdir(os.path.dirname(os.path.abspath(sys.argv[0])))


class Window(Frame):
    """Window of the application"""
    def __init__(self):
        self.tk = Tk()
        self.tk.attributes('-fullscreen', True)
        self.tk.title("Coquinaria")
        self.state = True
        self.tk.bind("<F11>", lambda _: utils.toggle_fullscreen(self))
        self.tk.bind("<Escape>", lambda _: utils.end_fullscreen(self))

        B1 = Button(self.tk,
                    text="Entrées",
                    command=self.entree,
                    font=utils.HUGE_FONT)
        B1.grid(row=3, column=1, sticky=NSEW)
        B2 = Button(self.tk,
                    text="Plats",
                    command=self.plat,
                    font=utils.HUGE_FONT)
        B2.grid(row=3, column=3, sticky=NSEW)
        B3 = Button(self.tk,
                    text="Sauces",
                    command=self.sauce,
                    font=utils.HUGE_FONT)
        B3.grid(row=3, column=5, sticky=NSEW)
        B4 = Button(self.tk,
                    text="Biscuits",
                    command=self.biscuits,
                    font=utils.HUGE_FONT)
        B4.grid(row=5, column=1, sticky=NSEW)
        B5 = Button(self.tk,
                    text="Gâteaux",
                    command=self.gateaux,
                    font=utils.HUGE_FONT)
        B5.grid(row=5, column=3, sticky=NSEW)
        B6 = Button(self.tk,
                    text="Boulangerie",
                    command=self.boul,
                    font=utils.HUGE_FONT)
        B6.grid(row=5, column=5, sticky=NSEW)
        B7 = Button(self.tk,
                    text="Recettes",
                    font=utils.HUGE_FONT)
        B7.grid(row=0, column=0, columnspan=4)
        B8 = Button(self.tk,
                    text="Menu",
                    command=self.menu,
                    font=utils.HUGE_FONT)
        B8.grid(row=0, column=4, columnspan=4)
        Lab = Label(self.tk,
                    text="Heure",
                    font=utils.HUGE_FONT)
        Lab.grid(row=0, column=8)

        for child in self.tk.winfo_children():
            child.grid_configure(padx=5, pady=5)

    def entree(self):
        """Entree button pressed, display all the recipes from
        this kind of food."""
        utils.popupmsg("Pas encore implémenté")

    def plat(self):
        """Plat button pressed, display all the recipes from
        this kind of food."""
        utils.popupmsg("Pas encore implémenté")

    def sauce(self):
        """Sauce button pressed, display all the recipes from
        this kind of food."""
        utils.popupmsg("Pas encore implémenté")

    def biscuits(self):
        """Biscuits button pressed, display all the recipes from
        this kind of food."""
        utils.popupmsg("Pas encore implémenté")

    def gateaux(self):
        """Gateaux button pressed, display all the recipes from
        this kind of food."""
        utils.popupmsg("Pas encore implémenté")

    def boul(self):
        """Boulangerie button pressed, display all the recipes
        from this kind of food."""
        utils.popupmsg("Pas encore implémenté")

    def menu(self):
        """Display the menu chosen for the week"""
        utils.popupmsg("Pas encore implémenté")

w = Window()
w.mainloop()
