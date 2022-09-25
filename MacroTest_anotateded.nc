%
O0405(PROGRAM_NUMMER)
(DATEO09/18/22 TIMEO14O49O15)
G54G90G80G17G40G94(G-CODE)

G52X0Y0Z0(RESETTER_G52_I_X_OG_Y)

#102=5(#-OF-PARTS-IN-X) 
#105=80(PITCH-IN-X) 

#1=0(SÆTTER_PARAMETER_1=0)
#2=0(SÆTTER_PARAMETER_2=0)
T11M6(SKIFTER_VÆRKTOEJ)
S1000M3(OMDR_TIL_1000_OG_STARTER_SPINDLEN)
M8(KOELEVAND_START)

N2000(LINIENUMMER)
#1=[#1+1](TAELLER_#1_FOR_OF-PARTS-IN-X)
G52X#2(FLYTTER_0_PUNKT_TIL_#2_ABSELUT_KORDINAT_I_X) 

G0X10Y0(G-CODE)
G43H11Z2(G-CODE)
G1Z-10(G-CODE)
X10(G-CODE)
G0Z2(G-CODE)

#2=[#2+#105](TAELLER_#2_FOR_PITCH-IN-X)
IF[#1EQ#102]GOTO2010(GAAR_TIL_N2010_HVIS#1=#102_ANTAL_PARTER_I-X_RETNING)
GOTO2000(RETUR_TIL_LINIE_N2000)

(NYT_LOOP)
N2010(LINIE_NUMMER)
#1=0(SAETTER_PARAMETER_1=0)
#2=0(SAETTER_PARAMETER_2=0)
T12M6(SKIFTER_VÆRKTOEJ)
S800M3(OMDR_TIL_1000_OG_STARTER_SPINDLEN)
M8(KOELEVAND_START)

N2020(LINIE_NUMMER)
#1=[#1+1](TAELLER_#1_FOR_OF-PARTS-IN-X)
G52X#2(FLYTTER_0_PUNKT_TIL_#2_ABSELUT_KORDINAT_I_X)

G0X10Y0(G-CODE)
G43H11Z2(G-CODE)
G1Z-10(G-CODE)
Y-10(G-CODE)
G0Z2(G-CODE)

#2=[#2+#105](TAELLER_#2_FOR_PITCH-IN-X)
IF[#1EQ#102]GOTO2060(GAAR_TIL_N2060_HVIS#1=#102_ANTAL_PARTER_I-X_RETNING)
GOTO2020(RETUR_TIL_LINIE_N2020)

(FINISH) 
N2060(LINIE_NUMMER)
M9(KØLEVAND_STOP)
M5(SPINDEL_STOP)
G52X0Y0Z0(RESETTER_G52_I_X_OG_Y)
M30(PROGRAM_STOP)
%